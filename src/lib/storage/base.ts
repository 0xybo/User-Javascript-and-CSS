import { browser, computed, nextTick, reactive, ref } from '#imports';
import { PlainObject } from '@/types/json';
import { useThrottleFn } from '@vueuse/core';
import { watch } from 'vue';
import { Logger } from '../logger';
import { deepMerge, diff, IS_DEVELOPMENT, printDiff } from '../utils';
import { IDraft, IInfo, IModule, IRule, ISettings, IStorage, StorageChanges } from './types';
import { clean, DEFAULTS, EMITTER, parse } from './utils';

/**
 * A service class that manages the storage of rules, modules, drafts, and settings. It provides methods to load, save, reset, and synchronize data with remote storage.
 */
export class StorageServiceBase {
    /**
     * Information about the storage, including metadata such as the last updated timestamp and the emitter ID.
     */
    info = reactive(DEFAULTS.INFO()) as IInfo;
    /**
     * User settings for the storage, including preferences and configurations.
     */
    settings = reactive(DEFAULTS.SETTINGS()) as ISettings;
    /**
     * A reactive array of rules stored in the storage.
     */
    rules = reactive(DEFAULTS.RULES()) as IRule[];
    /**
     * A reactive array of modules stored in the storage.
     */
    modules = reactive(DEFAULTS.MODULES()) as IModule[];
    /**
     * A reactive array of drafts stored in the storage.
     */
    drafts = reactive(DEFAULTS.DRAFTS()) as IDraft[];
    /**
     * A flag indicating whether the storage has been loaded.
     */
    loaded = ref(false);

    /**
     * A private reactive object that holds the current state of the storage. This is used internally to track changes and provide a computed property for the current storage state.
     */
    private _current: IStorage = reactive({
        info: this.info,
        settings: this.settings,
        rules: this.rules,
        modules: this.modules,
        drafts: this.drafts,
    });

    /**
     * A computed property that returns the current storage state. This is a reactive object that reflects the current state of the storage, including info, settings, rules, modules, and drafts.
     */
    get current() {
        return this._current;
    }

    /**
     * A computed property that watches the current storage state for changes. This is used for debugging purposes in development mode to log changes to the storage.
     */
    private computedCurrentToBeWatched;

    /**
     * A reactive object that holds information about the last known state of the remote storage. This is used to determine if the local storage is more recent than the remote storage when syncing.
     */
    protected remoteInfo = reactive(DEFAULTS.REMOTE_INFO());
    /**
     * A flag indicating whether the storage is currently being saved. This is used to prevent recursive saves when changes are detected in the storage.
     */
    private _saving = true;

    constructor() {
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
                { deep: true, flush: 'sync' },
            );
        }

        browser.storage.local.onChanged.addListener(
            useThrottleFn(
                async (changes: StorageChanges<IStorage>) => {
                    if ((changes.info?.newValue?.emitter || this.info.emitter) === EMITTER) return;
                    try {
                        const newValue = await browser.storage.local.get();
                        this._saving = false;
                        this._mergeIn(newValue);
                        nextTick(() => (this._saving = true));
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
     * Merges the given raw plain object into the current storage state. This method is used internally to update the storage state when changes are detected in the local storage.
     *
     * @param raw The raw plain object representing the new storage state.
     */
    private _mergeIn(raw: PlainObject) {
        const parsed = parse(raw);
        Object.assign(this.info, parsed.info);
        Object.assign(this.settings, parsed.settings);
        this.rules.splice(0, this.rules.length, ...parsed.rules);
        this.modules.splice(0, this.modules.length, ...parsed.modules);
        this.drafts.splice(0, this.drafts.length, ...parsed.drafts);
        this.loaded.value = true;
    }

    /**
     * Loads the storage state from the local storage. If the local storage is empty, it initializes the storage with default values and saves it.
     */
    async load() {
        const saved = parse((await browser.storage.local.get()) as unknown as PlainObject);
        this._mergeIn(saved);

        if (!(await browser.storage.local.getBytesInUse())) await this.save();

        Logger.debug('Settings loaded');
    }

    /**
     * Saves the current storage state to the local storage. This method is throttled to prevent excessive writes to the local storage.
     */
    async save() {
        if (!this._saving) return;
        this.info.updated = Date.now();
        this.info.emitter = EMITTER;

        const cleaned = clean(this.current);
        await browser.storage.local.set(cleaned);

        const keys = await browser.storage.local.getKeys();
        await browser.storage.local.remove(keys.filter((k) => !(k in cleaned)));

        Logger.debug('Settings saved.');
    }

    /**
     * Resets the storage state to the default values and saves it to the local storage.
     */
    async reset() {
        deepMerge(this.current, DEFAULTS.STORAGE());
        await this.save();
    }
}
