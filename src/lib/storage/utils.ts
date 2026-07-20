import { PlainObject } from '@/types/json';
import { compress as _compress } from '../compression';
import { clone } from '../utils';
import { zDraft, zInfo, zModule, zRemoteSettingsInfo, zRule, zSettings, zStorage } from './schema';
import { DraftT, FileT, ItemT, ItemType, ModuleT, RuleT, StorageT } from './types';

/**
 * A unique identifier for the current instance of the storage service. This is used to identify changes made by this instance when listening for changes in the browser's local storage.
 */
export const EMITTER = crypto.randomUUID();

/**
 * Default values for various storage-related entities. Each property is a function that returns a default instance of the corresponding type.
 */
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

/**
 * Type guard to check if the given item, draft, or type is a Rule.
 *
 * @param item The item to check.
 * @returns True if the item is a Rule, false otherwise.
 */
export function isRule(item: ItemT): item is RuleT;
/**
 * Type guard to check if the given draft is a Rule draft.
 *
 * @param draft The draft to check.
 * @returns True if the draft is a Rule draft, false otherwise.
 */
export function isRule(draft: DraftT): draft is DraftT<RuleT>;
/**
 * Type guard to check if the given type is a Rule type.
 *
 * @param type The type to check.
 * @returns True if the type is a Rule type, false otherwise.
 */
export function isRule(type: ItemType): type is ItemType.Rule;
export function isRule(itemOrDraftOrType: ItemT | DraftT | ItemType): boolean {
    if (typeof itemOrDraftOrType === 'string') return itemOrDraftOrType === ItemType.Rule;
    if ('item' in (itemOrDraftOrType as DraftT))
        return (itemOrDraftOrType as DraftT).item.type === ItemType.Rule;
    return (itemOrDraftOrType as ItemT).type === ItemType.Rule;
}

/**
 * Type guard to check if the given item, draft, or type is a Module.
 *
 * @param item The item to check.
 * @returns True if the item is a Module, false otherwise.
 */
export function isModule(item: ItemT): item is ModuleT;
/**
 * Type guard to check if the given draft is a Module draft.
 *
 * @param draft The draft to check.
 * @returns True if the draft is a Module draft, false otherwise.
 */
export function isModule(draft: DraftT): draft is DraftT<ModuleT>;
/**
 * Type guard to check if the given type is a Module type.
 *
 * @param type The type to check.
 * @returns True if the type is a Module type, false otherwise.
 */
export function isModule(type: ItemType): type is ItemType.Module;
export function isModule(itemOrDraftOrType: ItemT | DraftT | ItemType): boolean {
    if (typeof itemOrDraftOrType === 'string') return itemOrDraftOrType === ItemType.Module;
    if ('item' in (itemOrDraftOrType as DraftT))
        return (itemOrDraftOrType as DraftT).item.type === ItemType.Module;
    return (itemOrDraftOrType as ItemT).type === ItemType.Module;
}

/**
 * Cleans the given storage settings by removing unnecessary properties and preparing it for saving or syncing.
 *
 * This function is needed because extension and local storage APIs have limitations on the size of data that can be stored, and we want to avoid storing unnecessary data.
 *
 * @param settings The storage settings to clean.
 * @param sync Whether to prepare the settings for syncing (default: false).
 * @returns The cleaned storage settings.
 */
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
        if (rule.script.compiled) {
            cleaned[`f:${rule.script.id}:c`] = rule.script.compiled;
            delete rule.script.compiled;
        }
        if (rule.style.compiled) {
            cleaned[`f:${rule.style.id}:c`] = rule.style.compiled;
            delete rule.style.compiled;
        }
    }
    for (const module of cleaned.modules as ModuleT[]) {
        for (const file of module.files) {
            cleaned[`f:${file.id}`] = file.content;
            delete (file as Partial<FileT>).content;
        }
    }

    return cleaned;
}

/**
 * Parses the given plain object into a structured StorageT object, restoring file contents and draft items.
 *
 * @param settings The plain object representing storage settings.
 * @returns The parsed StorageT object.
 */
export function parse(settings: PlainObject): StorageT {
    for (const rule of (settings.rules || []) as RuleT[]) {
        rule.script.content = settings[`f:${rule.script.id}`] as string;
        rule.style.content = settings[`f:${rule.style.id}`] as string;
        rule.script.compiled = (settings[`f:${rule.script.id}:c`] as string) || '';
        rule.style.compiled = (settings[`f:${rule.style.id}:c`] as string) || '';
    }
    for (const module of (settings.modules || []) as ModuleT[]) {
        for (const file of module.files) {
            file.content = settings[`f:${file.id}`] as string;
        }
    }
    for (const draft of (settings.drafts || []) as DraftT[]) {
        draft.files = Object.fromEntries(
            (draft.files as unknown as string[])?.map((id) => [
                id,
                settings[`d:${id}`] as string,
            ]) || [],
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

/**
 * Compresses the given storage settings into an array of string chunks, each with a maximum size of 4096 characters.
 *
 * This function is useful for preparing storage settings for syncing or saving, especially when dealing with size limitations in storage APIs.
 *
 * @param settings The storage settings to compress.
 * @returns A promise that resolves to an array of compressed string chunks.
 */
export async function compress(settings: StorageT): Promise<string[]> {
    const cleaned = clean(settings, true);
    const compressed = await _compress(cleaned);
    const chunks = [];
    let i = 0;
    while (i < compressed.length) chunks.push(compressed.slice(i, (i += 4096)));

    return chunks;
}
