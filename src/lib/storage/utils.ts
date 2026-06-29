import { PlainObject } from '@/types/json';
import { compress as _compress } from '../compression';
import { clone } from '../utils';
import { zDraft, zInfo, zModule, zRemoteSettingsInfo, zRule, zSettings, zStorage } from './schema';
import { DraftT, FileT, ItemT, ItemType, ModuleT, RuleT, StorageT } from './types';

export const DEFAULTS = {
    RULES: () => [] as RuleT[],
    MODULES: () => [] as ModuleT[],
    DRAFTS: () => [] as DraftT[],
    INFO: () => zInfo.parse({}),
    SETTINGS: () => zSettings.parse({}),
    RULE: () => zRule.parse({}),
    MODULE: () => zModule.parse({}),
    DRAFT: <TItem extends ItemT | ItemType = ItemT>() => zDraft.parse({}) as DraftT<TItem>,
    REMOTE_INFO: () => zRemoteSettingsInfo.parse({}),
    STORAGE: () => zStorage.parse({}),
};

export function isRule(item: ItemT): item is RuleT;
export function isRule(draft: DraftT): draft is DraftT<RuleT>;
export function isRule(type: ItemType): type is ItemType.Rule;
export function isRule(itemOrDraftOrType: ItemT | DraftT | ItemType): boolean {
    if (typeof itemOrDraftOrType === 'string') return itemOrDraftOrType === ItemType.Rule;
    if ('item' in (itemOrDraftOrType as DraftT))
        return (itemOrDraftOrType as DraftT).item.type === ItemType.Rule;
    return (itemOrDraftOrType as ItemT).type === ItemType.Rule;
}

export function isModule(item: ItemT): item is ModuleT;
export function isModule(draft: DraftT): draft is DraftT<ModuleT>;
export function isModule(type: ItemType): type is ItemType.Module;
export function isModule(itemOrDraftOrType: ItemT | DraftT | ItemType): boolean {
    if (typeof itemOrDraftOrType === 'string') return itemOrDraftOrType === ItemType.Module;
    if ('item' in (itemOrDraftOrType as DraftT))
        return (itemOrDraftOrType as DraftT).item.type === ItemType.Module;
    return (itemOrDraftOrType as ItemT).type === ItemType.Module;
}

export function clean(settings: StorageT, sync: boolean = false): StorageT {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleaned: any = clone(settings);

    if (sync) {
        cleaned.rules = settings.rules.filter((rule: RuleT) => rule.sync);
        cleaned.modules = settings.modules.filter((module: ModuleT) => module.sync);
        delete cleaned.drafts;
        delete cleaned.info.emitter;
    } else {
        for (const draft of cleaned.drafts as DraftT[]) {
            for (const file in draft.files) {
                cleaned[`d:${file}`] = draft.files[file];
            }
            (draft.files as unknown as string[]) = Object.entries(draft.files).map(
                ([id, content]) => {
                    cleaned[`d:${id}`] = content;
                    return id;
                },
            );
            (draft.item as unknown as string) = draft.item.id;
        }
    }

    for (const rule of cleaned.rules) {
        cleaned[`f:${rule.script.id}`] = rule.script.content;
        delete rule.script.content;
        cleaned[`f:${rule.style.id}`] = rule.style.content;
        delete rule.style.content;
    }
    for (const module of cleaned.modules as ModuleT[]) {
        for (const file of module.files) {
            cleaned[`f:${file.id}`] = file.content;
            delete (file as Partial<FileT>).content;
        }
    }

    return cleaned;
}

export function parse(settings: PlainObject): StorageT {
    for (const rule of (settings.rules || []) as RuleT[]) {
        rule.script.content = settings[`f:${rule.script.id}`] as string;
        rule.style.content = settings[`f:${rule.style.id}`] as string;
    }
    for (const module of (settings.modules || []) as ModuleT[]) {
        for (const file of module.files) {
            file.content = settings[`f:${file.id}`] as string;
        }
    }
    for (const draft of (settings.drafts || []) as DraftT[]) {
        draft.files = Object.fromEntries(
            (draft.files as unknown as string[]).map((id) => [id, settings[`d:${id}`] as string]),
        );
        draft.item =
            (settings.rules as RuleT[]).find(
                (rule) => rule.id === (draft.item as unknown as string),
            ) ||
            (settings.modules as ModuleT[]).find(
                (module) => module.id === (draft.item as unknown as string),
            )!;
    }

    for (const key in settings) {
        if (/^[df]:/.test(key)) delete settings[key];
    }

    return zStorage.parse(settings);
}

export async function compress(settings: StorageT): Promise<string[]> {
    const cleaned = clean(settings, true);
    const compressed = await _compress(cleaned);
    const chunks = [];
    let i = 0;
    while (i < compressed.length) chunks.push(compressed.slice(i, (i += 4096)));

    return chunks;
}
