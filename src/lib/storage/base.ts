import { browser, computed, nextTick, reactive } from '#imports';
import { PlainObject } from '@/types/json';
import { useDebounceFn, useThrottleFn } from '@vueuse/core';
import { watch, type ComputedRef } from 'vue';
import { Logger } from '../logger';
import { deepMerge, diff, printDiff } from '../utils';
import { IS_DEVELOPMENT } from '../utils/development';
import { IDraft, IInfo, IModule, IRule, ISettings, IStorage, StorageChanges } from './types';
import { clean, DEFAULTS, EMITTER, parse } from './utils';

/**
 * A service class that manages the storage of rules, modules, drafts, and settings. It provides
 * methods to load, save, reset, and synchronize data with remote storage.
 */
export class StorageServiceBase {
    /**
     * Information about the storage, including metadata such as the last updated timestamp and the
     * emitter ID.
     */
    info = DEFAULTS.INFO() as IInfo;
    /**
     * User settings for the storage, including preferences and configurations.
     */
    settings = DEFAULTS.SETTINGS() as ISettings;
    /**
     * A reactive array of rules stored in the storage.
     */
    rules = DEFAULTS.RULES() as IRule[];
    /**
     * A reactive array of modules stored in the storage.
     */
    modules = DEFAULTS.MODULES() as IModule[];
    /**
     * A reactive array of drafts stored in the storage.
     */
    drafts = DEFAULTS.DRAFTS() as IDraft[];
    /**
     * A flag indicating whether the storage has been loaded.
     */
    loaded = false;

    /**
     * A computed property that returns the current storage state. This is a reactive object
     * that reflects the current state of the storage, including info, settings, rules, modules,
     * and drafts.
     */
    get current() {
        return {
            info: this.info,
            settings: this.settings,
            rules: this.rules,
            modules: this.modules,
            drafts: this.drafts,
        };
    }

    /**
     * A computed property that watches the current storage state for changes. This is used for
     * debugging purposes in development mode to log changes to the storage.
     */
    private computedCurrentToBeWatched: ComputedRef<IStorage> | null = null;

    /**
     * A reactive object that holds information about the last known state of the remote storage.
     * This is used to determine if the local storage is more recent than the remote storage when syncing.
     */
    protected remoteInfo = DEFAULTS.REMOTE_INFO();

    /**
     * A flag indicating whether the storage is currently being updated. This is used to prevent concurrent
     * updates and ensure that the storage is saved in a consistent state.
     */
    private updating: Promise<void> | null = null;

    /**
     * Whether the storage is currently mid-update (loading/merging/saving). Watchers on the
     * reactive storage state should not trigger a save while this is true, otherwise a save that
     * mutates the watched state (e.g. stamping an updated timestamp) re-triggers the watcher,
     * producing an endless save loop.
     */
    public get isUpdating(): boolean {
        return this.updating !== null;
    }

    /**
     * Starts the updating process by creating a new promise that resolves when the update is
     * complete. This is used to prevent concurrent updates and ensure that the storage is saved
     * in a consistent state.
     *
     * @returns A function that can be called to end the updating process and resolve the promise.
     */
    private startUpdating(): () => void {
        const { promise, resolve } = Promise.withResolvers<void>();
        this.updating = promise;

        return () =>
            nextTick(() => {
                resolve();
                this.updating = null;
            });
    }

    private reactive: StorageServiceBase;

    constructor() {
        this.reactive = reactive(this) as unknown as StorageServiceBase;
        this.onLoaded(this.initializeStorageWatchers.bind(this));

        return this.reactive;
    }

    /**
     * Registers a callback function to be called when the storage has finished loading. If the
     * storage is already loaded, the callback is called immediately. Otherwise, it is called
     * once the storage has finished loading.
     *
     * @param callback The callback function to be called when the storage is loaded.
     */
    public onLoaded(callback: () => void) {
        if (this.loaded) callback();
        else
            watch(
                () => this.reactive.loaded,
                (loaded) => loaded && callback(),
                { once: true },
            );
    }

    /**
     * Internal method that is called when the storage has finished loading. It sets up watchers
     * to monitor changes in the storage and log them if in development mode. It also sets up a
     * debounced save function to save the storage state when changes are detected.
     * Additionally, it listens for changes in the browser's local storage and merges them into
     * the current storage state if they are from a different emitter.
     */
    private initializeStorageWatchers() {
        // Watch for changes in the storage and log them if in development mode.
        if (IS_DEVELOPMENT) {
            this.computedCurrentToBeWatched = computed(() =>
                JSON.parse(JSON.stringify(this.current)),
            );

            watch(
                this.computedCurrentToBeWatched,
                (newValue, oldValue) => {
                    const [message, ...substitutions] = printDiff(diff(oldValue, newValue));
                    Logger.debug('Storage changed:\n' + message, ...substitutions);
                },
                { deep: true },
            );
        }

        const debouncedSave = useDebounceFn(() => this.save(), 200, { maxWait: 1000 });
        watch(
            [
                this.reactive.drafts,
                this.reactive.rules,
                this.reactive.modules,
                this.reactive.settings,
            ],
            () => this.updating || debouncedSave(),
            { deep: true },
        );

        browser.storage.local.onChanged.addListener(
            useThrottleFn(
                async (changes: StorageChanges<IStorage>) => {
                    if ((changes.info?.newValue?.emitter || this.info.emitter) === EMITTER) return;
                    try {
                        const newValue = await browser.storage.local.get();

                        const endUpdating = this.startUpdating();

                        this.mergeIn(newValue, false);
                        Logger.debug('Storage updated from remote changes.');

                        endUpdating();
                    } catch (e) {
                        Logger.error('Failed to parse storage change:', e);
                    }
                },
                500,
                true,
            ),
        );
    }

    /**
     * Merges the given raw plain object into the current storage state. This method is used
     * internally to update the storage state when changes are detected in the local storage.
     *
     * When merging changes received from other contexts (mergeInfo === false), only the resolved
     * theme is taken over from the `info` object. The `emitter`, `created` and `updated`
     * timestamps are kept local on purpose: otherwise a context that just received a remote update
     * would see its own `emitter` change and trigger a save-back, causing an endless write loop
     * between contexts (each save stamps its own random emitter).
     *
     * @param raw The raw plain object representing the new storage state.
     * @param mergeInfo Whether to fully merge the `info` metadata (default: true).
     */
    private mergeIn(raw: PlainObject, mergeInfo: boolean = true) {
        const parsed = parse(raw);
        if (mergeInfo) Object.assign(this.info, parsed.info);
        else this.info.theme = parsed.info.theme;
        Object.assign(this.settings, parsed.settings);
        this.rules.splice(0, this.rules.length, ...parsed.rules);
        this.modules.splice(0, this.modules.length, ...parsed.modules);
        this.drafts.splice(0, this.drafts.length, ...parsed.drafts);
        this.loaded = true;
    }

    /**
     * Loads the storage state from the local storage. If the local storage is empty, it
     * initializes the storage with default values and saves it.
     */
    async load() {
        const saved = (await browser.storage.local.get()) as unknown as PlainObject;
        this.mergeIn(saved);

        if (!(await browser.storage.local.getBytesInUse())) await this.save();

        Logger.debug('Settings loaded');
    }

    /**
     * Saves the current storage state to the local storage. This method is throttled to prevent
     * excessive writes to the local storage.
     */
    async save() {
        if (this.updating) await this.updating;

        const endUpdating = this.startUpdating();

        this.info.updated = Date.now();
        this.info.emitter = EMITTER;

        const cleaned = clean(this.current);
        await browser.storage.local.set(cleaned);

        const keys = await browser.storage.local.getKeys();
        await browser.storage.local.remove(keys.filter((k) => !(k in cleaned)));

        Logger.debug('Settings saved.');

        endUpdating();
    }

    /**
     * Resets the storage state to the default values and saves it to the local storage.
     */
    async reset() {
        deepMerge(this.current, DEFAULTS.STORAGE());
        await this.save();
    }

    /**
     * Replaces the whole storage state with the given one and saves it. Used for importing from
     * other sources (e.g. the legacy v3.1.2 extension data). The previous rules, modules and
     * drafts are discarded.
     *
     * @param data The complete storage state to import.
     */
    async importData(data: IStorage) {
        const endUpdating = this.startUpdating();

        Object.assign(this.info, data.info);
        Object.assign(this.settings, data.settings);
        this.rules.splice(0, this.rules.length, ...data.rules);
        this.modules.splice(0, this.modules.length, ...data.modules);
        this.drafts.splice(0, this.drafts.length, ...data.drafts);

        endUpdating();
        await this.save();
    }

    /**
     * Returns the total number of bytes currently used in the local storage area. The value is
     * measured as the JSON stringification of every value plus every key length.
     *
     * @returns The amount of space (in bytes) used by the local storage.
     */
    async getLocalBytesInUse(): Promise<number> {
        return browser.storage.local.getBytesInUse();
    }

    /**
     * Returns a JSON string representation of the current storage state, excluding any f: and d:
     * prefixed keys. This is useful for debugging and exporting the storage state.
     *
     * @returns A JSON string representation of the current storage state.
     */
    getRaw() {
        return JSON.stringify(clean(this.current), null, 2);
    }
}
