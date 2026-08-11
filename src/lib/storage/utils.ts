import { PlainObject } from '@/types/json';
import { compress as _compress } from '../compression';
import { clone } from '../utils';
import { zDraft, zInfo, zModule, zRemoteSettingsInfo, zRule, zSettings, zStorage } from './schema';
import { IDraft, IItem, IModule, IRule, IStorage, ItemType } from './types';

/**
 * A unique identifier for the current instance of the storage service. This is used to identify changes made by this instance when listening for changes in the browser's local storage.
 */
export const EMITTER = crypto.randomUUID();

/**
 * Default values for various storage-related entities. Each property is a function that returns a default instance of the corresponding type.
 */
export const DEFAULTS = {
    RULES: () => [] as IRule[],
    MODULES: () => [] as IModule[],
    DRAFTS: () => [] as IDraft[],
    INFO: () => zInfo.parse({}),
    SETTINGS: () => zSettings.parse({}),
    RULE: () => zRule.parse({}),
    MODULE: () => zModule.parse({}),
    DRAFT: <TItem extends IItem | ItemType = IItem>() => zDraft.parse({}) as IDraft<TItem>,
    REMOTE_INFO: () => zRemoteSettingsInfo.parse({}),
    STORAGE: () => zStorage.parse({}),
};

/**
 * Type guard to check if the given item, draft, or type is a Rule.
 *
 * @param item The item to check.
 * @returns True if the item is a Rule, false otherwise.
 */
export function isRule(item: IItem): item is IRule;
/**
 * Type guard to check if the given draft is a Rule draft.
 *
 * @param draft The draft to check.
 * @returns True if the draft is a Rule draft, false otherwise.
 */
export function isRule(draft: IDraft): draft is IDraft<IRule>;
/**
 * Type guard to check if the given type is a Rule type.
 *
 * @param type The type to check.
 * @returns True if the type is a Rule type, false otherwise.
 */
export function isRule(type: ItemType): type is ItemType.Rule;
export function isRule(itemOrDraftOrType: IItem | IDraft | ItemType): boolean {
    if (typeof itemOrDraftOrType === 'string') return itemOrDraftOrType === ItemType.Rule;
    if ('item' in (itemOrDraftOrType as IDraft))
        return (itemOrDraftOrType as IDraft).item.type === ItemType.Rule;
    return (itemOrDraftOrType as IItem).type === ItemType.Rule;
}

/**
 * Type guard to check if the given item, draft, or type is a Module.
 *
 * @param item The item to check.
 * @returns True if the item is a Module, false otherwise.
 */
export function isModule(item: IItem): item is IModule;
/**
 * Type guard to check if the given draft is a Module draft.
 *
 * @param draft The draft to check.
 * @returns True if the draft is a Module draft, false otherwise.
 */
export function isModule(draft: IDraft): draft is IDraft<IModule>;
/**
 * Type guard to check if the given type is a Module type.
 *
 * @param type The type to check.
 * @returns True if the type is a Module type, false otherwise.
 */
export function isModule(type: ItemType): type is ItemType.Module;
export function isModule(itemOrDraftOrType: IItem | IDraft | ItemType): boolean {
    if (typeof itemOrDraftOrType === 'string') return itemOrDraftOrType === ItemType.Module;
    if ('item' in (itemOrDraftOrType as IDraft))
        return (itemOrDraftOrType as IDraft).item.type === ItemType.Module;
    return (itemOrDraftOrType as IItem).type === ItemType.Module;
}

// --- Storage helpers ---

/**
 * Extracts file content into a storage key (f:<id>).
 */
function extractFile(target: Record<string, unknown>, file: { id: string; content: string }): void {
    target[`f:${file.id}`] = file.content;
}

/**
 * Extracts compiled content into a storage key (f:<id>:c).
 */
function extractCompiled(
    target: Record<string, unknown>,
    file: { id: string; compiled?: string },
): void {
    if (file.compiled) {
        target[`f:${file.id}:c`] = file.compiled;
    }
}

/**
 * Extracts draft files into storage keys (d:<id>) and returns the file IDs.
 */
function extractDraftFiles(
    target: Record<string, unknown>,
    files: Record<string, string>,
): string[] {
    for (const [id, content] of Object.entries(files)) {
        target[`d:${id}`] = content;
    }
    return Object.keys(files);
}

/**
 * Resolves file content from a storage key (f:<id>).
 */
function resolveFile<T extends { id: string }>(
    source: Record<string, unknown>,
    file: T,
): T & { content: string } {
    return { ...file, content: (source[`f:${file.id}`] as string) || '' };
}

/**
 * Resolves compiled content from a storage key (f:<id>:c).
 */
function resolveCompiled<T extends { id: string }>(
    source: Record<string, unknown>,
    file: T,
): T & { compiled: string } {
    return { ...file, compiled: (source[`f:${file.id}:c`] as string) || '' };
}

/**
 * Removes all f: and d: prefixed keys from the object and returns them separately.
 */
function extractStorageKeys(settings: Record<string, unknown>): Record<string, string> {
    const files: Record<string, string> = {};
    for (const key of Object.keys(settings)) {
        if (/^[df]:/.test(key)) {
            files[key] = settings[key] as string;
            delete settings[key];
        }
    }
    return files;
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
export function clean(settings: IStorage, sync: boolean = false): Record<string, unknown> {
    const cleaned = clone(settings) as Record<string, unknown>;

    if (sync) {
        cleaned.rules = settings.rules.filter((rule: IRule) => rule.sync);
        cleaned.modules = settings.modules.filter((module: IModule) => module.sync);
        delete (cleaned.info as Record<string, unknown>).emitter;
        delete (cleaned.info as Record<string, unknown>).theme;
    }

    delete cleaned.drafts;

    // Extract rule files
    for (const rule of cleaned.rules as IRule[]) {
        extractFile(cleaned, rule.script);
        extractFile(cleaned, rule.style);
        extractCompiled(cleaned, rule.script);
        extractCompiled(cleaned, rule.style);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (rule.script as any).content;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (rule.style as any).content;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('compiled' in rule.script) delete (rule.script as any).compiled;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('compiled' in rule.style) delete (rule.style as any).compiled;
    }

    // Extract module files
    for (const module of cleaned.modules as IModule[]) {
        for (const file of module.files) {
            extractFile(cleaned, file);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        module.files.forEach((f) => delete (f as any).content);
    }

    return cleaned;
}

/**
 * Parses the given plain object into a structured StorageT object, restoring file contents and draft items.
 *
 * @param settings The plain object representing storage settings.
 * @returns The parsed StorageT object.
 */
export function parse(settings: PlainObject): IStorage {
    const files = extractStorageKeys(settings);

    // Resolve rule files
    for (const rule of (settings.rules || []) as IRule[]) {
        rule.script = resolveCompiled(files, resolveFile(files, rule.script));
        rule.style = resolveCompiled(files, resolveFile(files, rule.style));
    }

    // Resolve module files
    for (const module of (settings.modules || []) as IModule[]) {
        module.files = module.files.map((f) => resolveFile(files, f));
    }

    // Resolve draft files and items
    for (const draft of (settings.drafts || []) as IDraft[]) {
        const fileIds = (draft as Record<string, unknown>).fileIds as string[] | undefined;
        draft.files = Object.fromEntries((fileIds || []).map((id) => [id, files[`d:${id}`] || '']));
        draft.item = [...(settings.rules as IRule[]), ...(settings.modules as IModule[])].find(
            (item) => item.id === (draft as Record<string, unknown>).itemId,
        )!;
        delete (draft as Record<string, unknown>).fileIds;
        delete (draft as Record<string, unknown>).itemId;
        delete (draft as Record<string, unknown>).itemType;
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
export async function compress(settings: IStorage): Promise<string[]> {
    const cleaned = clean(settings, true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compressed = await _compress(cleaned as any);
    const chunks = [];
    let i = 0;
    while (i < compressed.length) chunks.push(compressed.slice(i, (i += 4096)));

    return chunks;
}

/**
 * Checks if the given draft has unsaved changes compared to its original item.
 *
 * @param draft The draft to check for unsaved changes.
 * @returns True if the draft has unsaved changes, false otherwise.
 */
export function isRuleUnsaved(draft: IDraft<IRule>): boolean {
    return (
        (draft.files[draft.item.script.id] &&
            draft.item.script.content &&
            draft.files[draft.item.script.id] !== draft.item.script.content) ||
        (draft.files[draft.item.style.id] &&
            draft.item.style.content &&
            draft.files[draft.item.style.id] !== draft.item.style.content) ||
        (draft.isNew && Object.values(draft.files).some((content) => content !== ''))
    );
}

/**
 * Checks if the given module draft has unsaved changes compared to its original item. It compares
 * the content of each file in the module.
 *
 * @param draft The draft to check for unsaved changes.
 * @returns True if the draft has unsaved changes, false otherwise.
 */
export function isModuleUnsaved(draft: IDraft<IModule>): boolean {
    return (
        draft.item.files.some(
            (file) => file.content && draft.files[file.id] && file.content !== draft.files[file.id],
        ) ||
        (draft.isNew && Object.values(draft.files).some((content) => content !== ''))
    );
}

/**
 * Checks if the given draft has changed compared to its original item. For rules, it compares the
 * script and style content. For modules, it compares the content of each file in the module.
 *
 * @param draft The draft to check for changes.
 * @returns True if the draft has changed, false otherwise.
 */
export function isUnsaved(draft: IDraft): boolean {
    return isRule(draft) ? isRuleUnsaved(draft) : isModuleUnsaved(draft as IDraft<IModule>);
}
