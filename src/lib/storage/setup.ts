import { browser, nextTick, reactive, ref } from '#imports';
import { useThrottleFn } from '@vueuse/core';
import {
    defineStore,
    type _ExtractActionsFromSetupStore,
    type _ExtractGettersFromSetupStore,
    type _ExtractStateFromSetupStore,
    type Store as _Store,
    type StoreDefinition as _StoreDefinition,
} from 'pinia';
import { decompress } from '../compression';
import {
    StorageInvalidSyncData,
    StorageLocalMoreRecentError,
    StorageRemoteMoreRecentError,
} from '../errors';
import { Logger } from '../logger';
import { deepMerge, diff, IS_DEV, isPlainObject } from '../utils';
import {
    type RemoteSettings,
    type StorageChanges,
    type StorageStoreBase,
    type StorageT,
} from './types';
import { clean, clone, compress, DEFAULTS, parse } from './utils';

type Extension<TBase extends StorageStoreBase = StorageStoreBase> = (base: TBase) => TBase;
type StoreDefinition<TBase extends StorageStoreBase = StorageStoreBase> = _StoreDefinition<
    'storage',
    _ExtractStateFromSetupStore<TBase>,
    _ExtractGettersFromSetupStore<TBase>,
    _ExtractActionsFromSetupStore<TBase>
>;
type Store<TBase extends StorageStoreBase = StorageStoreBase> = _Store<
    'storage',
    _ExtractStateFromSetupStore<TBase>,
    _ExtractGettersFromSetupStore<TBase>,
    _ExtractActionsFromSetupStore<TBase>
>;

export const EMITTER = crypto.randomUUID();

export class StorageStoreFactory<TBase extends StorageStoreBase = StorageStoreBase> {
    private extensions: Extension<TBase>[] = [];
    private postSetupHooks: ((store: Store<TBase>) => void)[] = [];
    private initialized: boolean = false;

    public extend<TExtension extends Extension<TBase>>(
        extension: TExtension,
    ): StorageStoreFactory<ReturnType<TExtension>> {
        this.extensions.push(extension);
        return this as unknown as StorageStoreFactory<ReturnType<TExtension>>;
    }

    public addPostSetupHook(hook: (store: Store<TBase>) => void): StorageStoreFactory<TBase> {
        this.postSetupHooks.push(hook);

        return this;
    }

    private setup(): TBase {
        return this.extensions.reduce(
            (store, extension) => extension(store as TBase),
            this._setup() as TBase,
        );
    }

    private postSetup(store: StoreDefinition<TBase>): StoreDefinition<TBase> {
        return (() => {
            const initializedStore = store() as Store<TBase>;
            if (!this.initialized) {
                for (const hook of this.postSetupHooks) hook(initializedStore);
                this.initialized = true;
            }
            return initializedStore;
        }) as StoreDefinition<TBase>;
    }

    public defineStore() {
        const store = defineStore('storage', this.setup.bind(this), {});
        return this.postSetup(store as StoreDefinition<TBase>);
    }

    private _setup(): StorageStoreBase {
        // -----------------------------
        // STATE
        // -----------------------------
        const info = reactive(DEFAULTS.INFO());
        const settings = reactive(DEFAULTS.SETTINGS());
        const rules = reactive(DEFAULTS.RULES());
        const modules = reactive(DEFAULTS.MODULES());
        const drafts = reactive(DEFAULTS.DRAFTS());

        const remoteInfo = reactive(DEFAULTS.REMOTE_INFO());
        const loaded = ref(false);
        let saving = true;

        // -----------------------------
        // GETTERS
        // -----------------------------
        const current = () =>
            ({
                info,
                settings,
                rules,
                modules,
                drafts,
            }) as StorageT;

        // -----------------------------
        // ACTIONS
        // -----------------------------
        const save = async () => {
            if (!saving) return;
            info.updated = Date.now();
            info.emitter = EMITTER;

            let old;
            if (IS_DEV) old = await browser.storage.local.get();

            const cleaned = clean(current());
            await browser.storage.local.set(cleaned);

            const keys = await browser.storage.local.getKeys();
            await browser.storage.local.remove(keys.filter((k) => !(k in cleaned)));

            if (IS_DEV) Logger.debug('Settings saved.', diff(old!, cleaned));
            else Logger.debug('Settings saved.');
        };

        const load = async () => {
            const saved = parse(await browser.storage.local.get());
            deepMerge(current(), saved);

            if (!(await browser.storage.local.getBytesInUse())) await save();

            loaded.value = true;
            if (IS_DEV) Logger.debug('Settings loaded', current());
            else Logger.debug('Settings loaded.');
        };

        const reset = async () => {
            deepMerge(current(), DEFAULTS.STORAGE());
            await save();
        };

        const syncInfo = async () => {
            const lastUpdated = remoteInfo.updated;
            const remote = (await browser.storage.sync.get<RemoteSettings>('info')).info;
            Object.assign(remoteInfo, remote);
            return lastUpdated !== remoteInfo.updated;
        };

        const upload = async (force = false) => {
            await syncInfo();
            if (!force && info.updated < remoteInfo.updated) throw StorageRemoteMoreRecentError;

            const chunks = await compress(current());
            await browser.storage.sync.clear();
            await browser.storage.sync.set({
                ...Object.fromEntries(chunks.map((c, i) => [i, c])),
                info: {
                    chunkLength: chunks.length,
                    updated: Date.now(),
                },
            });
        };

        const download = async (force = false) => {
            await syncInfo();
            if (!force && info.updated > remoteInfo.updated) throw StorageLocalMoreRecentError;

            const chunks = Object.values(
                await browser.storage.sync.get([...Array(remoteInfo.chunkLength).keys()]),
            );

            const decompressed = await decompress(chunks.join(''));
            if (!isPlainObject(decompressed)) throw StorageInvalidSyncData;
            const parsed = parse(decompressed);
            deepMerge(current(), parsed);
            await save();
        };

        // -----------------------------
        // Event listeners
        // -----------------------------
        const onLocalChanged = async (changes: StorageChanges<StorageT>) => {
            if ((changes.info?.newValue?.emitter || info.emitter) === EMITTER) return;

            let old;
            if (IS_DEV) old = clone(current());

            try {
                const newValue = await browser.storage.local.get();
                saving = false;
                deepMerge(current(), parse(newValue));
                nextTick(() => (saving = true));

                if (IS_DEV) Logger.debug('Local settings changed', changes, diff(old!, current()));
                else Logger.debug('Local settings changed');
            } catch (e) {
                Logger.error('Failed to parse settings from storage change:', e);
            }
        };

        browser.storage.local.onChanged.addListener(useThrottleFn(onLocalChanged, 500, true));

        // -----------------------------
        // PUBLIC API
        // -----------------------------
        return {
            info,
            settings,
            rules,
            modules,
            drafts,
            loaded,

            current,

            load,
            save,
            reset,
            upload,
            download,
        };
    }
}
