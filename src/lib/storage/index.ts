import { browser, nextTick, reactive, ref } from '#imports';
import { PlainObject } from '@/types/json';
import { useThrottleFn } from '@vueuse/core';
import { decompress as _decompress } from '../compression';
import {
    StorageInvalidSyncData,
    StorageLocalMoreRecentError,
    StorageRemoteMoreRecentError,
} from '../errors';
import { Logger } from '../logger';
import { clone, deepMerge, IS_DEV } from '../utils';
import {
    DraftT,
    InfoT,
    ItemT,
    ItemType,
    ModuleT,
    RemoteSettings,
    RuleT,
    SettingsT,
    StorageChanges,
    StorageT,
} from './types';
import { clean, compress, DEFAULTS, isModule, isRule, parse } from './utils';

export const EMITTER = crypto.randomUUID();

export class StorageService {
    info = reactive(DEFAULTS.INFO()) as InfoT;
    settings = reactive(DEFAULTS.SETTINGS()) as SettingsT;
    rules = reactive(DEFAULTS.RULES()) as RuleT[];
    modules = reactive(DEFAULTS.MODULES()) as ModuleT[];
    drafts = reactive(DEFAULTS.DRAFTS()) as DraftT[];
    loaded = ref(false);

    private remoteInfo = reactive(DEFAULTS.REMOTE_INFO());
    private _saving = true;

    constructor() {
        browser.storage.local.onChanged.addListener(
            useThrottleFn(
                async (changes: StorageChanges<StorageT>) => {
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

    get current(): StorageT {
        return {
            info: this.info,
            settings: this.settings,
            rules: this.rules as RuleT[],
            modules: this.modules as ModuleT[],
            drafts: this.drafts as DraftT[],
        };
    }

    private _mergeIn(raw: PlainObject) {
        const parsed = parse(raw);
        Object.assign(this.info, parsed.info);
        Object.assign(this.settings, parsed.settings);
        this.rules.splice(0, this.rules.length, ...parsed.rules);
        this.modules.splice(0, this.modules.length, ...parsed.modules);
        this.drafts.splice(0, this.drafts.length, ...parsed.drafts);
        this.loaded.value = true;
    }

    async load() {
        const saved = parse((await browser.storage.local.get()) as unknown as PlainObject);
        this._mergeIn(saved);
        if (!(await browser.storage.local.getBytesInUse())) await this.save();
        if (IS_DEV) Logger.debug('Settings loaded', this.current);
        else Logger.debug('Settings loaded.');
    }

    async save() {
        if (!this._saving) return;
        this.info.updated = Date.now();
        this.info.emitter = EMITTER;

        const cleaned = clean(this.current);
        await browser.storage.local.set(cleaned);

        const keys = await browser.storage.local.getKeys();
        await browser.storage.local.remove(keys.filter((k) => !(k in cleaned)));

        if (IS_DEV) Logger.debug('Settings saved.');
        else Logger.debug('Settings saved.');
    }

    async reset() {
        deepMerge(this.current, DEFAULTS.STORAGE());
        await this.save();
    }

    createDraftFromItem<TItem extends ItemT>(item: TItem): DraftT<TItem> {
        const draft = DEFAULTS.DRAFT<TItem>();
        if (isModule(item)) {
            const module = clone(item);
            Object.assign(draft, {
                isNew: false,
                item: module,
                files: Object.fromEntries(
                    module.files.filter((f) => !f.src).map((f) => [f.id, f.content]),
                ),
            });
        } else {
            const rule = item as RuleT;
            Object.assign(draft, {
                isNew: false,
                item: rule,
                files: {
                    [rule.script.id]: rule.script.content,
                    [rule.style.id]: rule.style.content,
                },
            });
        }
        const reactiveDraft = reactive(draft);
        this.drafts.push(reactiveDraft);
        return reactiveDraft as DraftT<TItem>;
    }

    createDraftFromType<TType extends ItemType>(type: TType): DraftT<TType> {
        const draft = DEFAULTS.DRAFT<TType>();
        if (isRule(type)) {
            const rule = draft.item as RuleT;
            draft.files = {
                [rule.script.id]: rule.script.content,
                [rule.style.id]: rule.style.content,
            };
        } else {
            draft.item = reactive(DEFAULTS.MODULE());
        }
        const reactiveDraft = reactive(draft);
        this.drafts.push(reactiveDraft);
        return reactiveDraft as DraftT<TType>;
    }

    discardDraft(draft: DraftT) {
        const index = this.drafts.findIndex((d) => d.item.id === draft.item.id);
        if (index !== -1) this.drafts.splice(index, 1);
    }

    async saveDraft(draft: DraftT) {
        if (isRule(draft)) {
            if (draft.isNew) this.rules.push(draft.item as RuleT);
            const rule = draft.item;
            rule.script.content = draft.files[rule.script.id];
            rule.style.content = draft.files[rule.style.id];

            if (rule.script.content) {
                try {
                    const { compileTS } = await import('../compiler/typescript');
                    const result = await compileTS(rule.script.content, {});
                    rule.script.compiled = result.output;
                } catch (e) {
                    Logger.error('TS compilation failed:', e);
                    rule.script.compiled = rule.script.content;
                }
            } else {
                rule.script.compiled = '';
            }

            rule.style.compiled = rule.style.content;

            rule.updated = Date.now();
        } else if (isModule(draft)) {
            if (draft.isNew) this.modules.push(draft.item);
            const module = draft.item;
            module.files.forEach((f) => (f.content = draft.files[f.id]));
        }
        draft.isNew = false;
        await this.save();
    }

    getDraftFromItem<TItem extends ItemT>(item: TItem): DraftT<TItem> | null {
        return (this.drafts.find((d) => d.item.id === item.id) as DraftT<TItem>) ?? null;
    }

    getDraftNewFromType<TType extends ItemType>(type: TType): DraftT<TType> | null {
        return (this.drafts.find((d) => d.isNew && d.item.type === type) as DraftT<TType>) ?? null;
    }

    getDraftFromId(id: string): DraftT | null {
        return this.drafts.find((d) => d.item.id === id) ?? null;
    }

    clearDrafts() {
        this.drafts.splice(0);
    }

    removeDraft(draft: DraftT) {
        const index = this.drafts.findIndex((d) => d.item.id === draft.item.id);
        if (index !== -1) this.drafts.splice(index, 1);
    }

    removeItem(item: ItemT) {
        const list = isRule(item) ? this.rules : this.modules;
        const index = list.findIndex((i) => i.id === item.id);
        if (index >= 0) list.splice(index, 1);
        const draft = this.getDraftFromItem(item);
        if (draft) this.removeDraft(draft);
    }

    getItemFromId(id: string): ItemT | null {
        return (
            this.rules.find((rule) => rule.id === id) ??
            this.modules.find((module) => module.id === id) ??
            null
        );
    }

    private async _syncInfo() {
        const lastUpdated = this.remoteInfo.updated;
        const remote = (await browser.storage.sync.get<RemoteSettings>('info')).info;
        Object.assign(this.remoteInfo, remote);
        return lastUpdated !== this.remoteInfo.updated;
    }

    async upload(force = false) {
        await this._syncInfo();
        if (!force && this.info.updated < this.remoteInfo.updated) {
            throw StorageRemoteMoreRecentError;
        }

        const chunks = await compress(this.current);
        await browser.storage.sync.clear();
        await browser.storage.sync.set({
            ...Object.fromEntries(chunks.map((c, i) => [i, c])),
            info: {
                chunkLength: chunks.length,
                updated: Date.now(),
            },
        });
    }

    async download(force = false) {
        await this._syncInfo();
        if (!force && this.info.updated > this.remoteInfo.updated) {
            throw StorageLocalMoreRecentError;
        }

        const chunks = Object.values(
            await browser.storage.sync.get([...Array(this.remoteInfo.chunkLength).keys()]),
        );

        const decompressed = await _decompress(chunks.join(''));
        if (typeof decompressed !== 'object' || decompressed === null) {
            throw StorageInvalidSyncData;
        }
        const parsed = parse(decompressed);
        deepMerge(this.current, parsed);
        await this.save();
    }
}

export const storage = new StorageService();

storage.load().catch((e) => {
    Logger.error('Failed to load storage:', e);
    if (IS_DEV) throw e;
});
