import z from 'zod';
import { compress, decompress } from './compression';
import { zEditor, zEditorMonaco } from './editor';
import { Logger } from './logger';
import { DarkThemePalette, LightThemePalette, Theme, zDarkThemePalette, zLightThemePalette, zTheme } from './theme';

export const zFile = z.object({
    name: z.string().optional(),
    id: z.string().default(() => crypto.randomUUID()),
    created: z.number().default(() => Date.now()),
    updated: z.number().default(() => Date.now()),
    content: z.string().default(''),
    src: z.string().optional(),
});
const zScript = zFile.extend({
    isolated: z.boolean().default(false),
    recursive: z.boolean().default(false),
});
const zStyle = zFile.extend({
    injected: z.boolean().default(false),
    important: z.boolean().default(false),
});
export const zStyleModule = z.intersection(
    z.object({ type: z.literal('css').default('css'), sync: z.boolean().default(true) }),
    zStyle,
);
export const zScriptModule = z.intersection(
    z.object({ type: z.literal('js').default('js'), sync: z.boolean().default(true) }),
    zScript,
);
export const zModule = z.union([zStyleModule, zScriptModule]);
export const zRule = z.object({
    name: z.string().optional(),
    id: z.string().default(() => crypto.randomUUID()),
    libs: z.array(zModule).default(() => []),
    created: z.number().default(() => Date.now()),
    updated: z.number().default(() => Date.now()),
    urls: z.array(z.string()).default(() => []),
    css: zStyle.default(() => zStyle.parse({})),
    js: zScript.default(() => zScript.parse({})),
    enabled: z.boolean().default(true),
    sync: z.boolean().default(true),
});

export enum SortBy {
    NameDescending = 'name_desc',
    NameAscending = 'name_asc',
    Created = 'created',
    Updated = 'updated',
}

export enum Draft {
    Rule = 'rule',
    Module = 'module',
}

export const zInfo = z.object({
    created: z.number().default(() => Date.now()),
    updated: z.number().default(() => Date.now()),
});

export const zSettings = z.object({
    sortBy: z.enum(SortBy).default(SortBy.NameDescending),
    badgeCount: z.boolean().default(true),
    editor: zEditor.default(() => zEditorMonaco.parse({})),
    theme: zTheme.default(Theme.Auto),
    themePalette: z
        .object({
            [Theme.Light]: zLightThemePalette.default(LightThemePalette.Chrome),
            [Theme.Dark]: zDarkThemePalette.default(DarkThemePalette.Monokai),
        })
        .default(() => ({ [Theme.Light]: LightThemePalette.Chrome, [Theme.Dark]: DarkThemePalette.Monokai })),
});

export const zStorage = z.object({
    info: zInfo.default(() => zInfo.parse({})),
    settings: zSettings.default(() => zSettings.parse({})),
    rules: z.array(zRule).default(() => []),
    modules: z.array(zModule).default(() => []),
    drafts: z
        .object({
            [Draft.Rule]: zRule.optional(),
            [Draft.Module]: zModule.optional(),
        })
        .default(() => ({})),
});

export type Rule = z.infer<typeof zRule>;
export type Module = z.infer<typeof zModule>;
export type Settings = z.infer<typeof zSettings>;
export type StorageT = z.infer<typeof zStorage>;

export const zRemoteSettingsInfo = z.object({
    chunkLength: z.number().default(0),
    updated: z.number().default(0),
});
export type RemoteSettingsInfo = z.infer<typeof zRemoteSettingsInfo>;
export type RemoteSettings = {
    [chunkIndex: number]: string;
    info: RemoteSettingsInfo;
};

export class RemoteMoreRecentError extends Error {
    message = 'Remote settings are newer than local settings.';
}

export const DEFAULT_SETTINGS = () => zStorage.parse({});
export const DEFAULT_REMOTE_INFO = () => zRemoteSettingsInfo.parse({});
export const DEFAULT_DRAFT = {
    [Draft.Rule]: () => zRule.parse({}),
    [Draft.Module]: () => zModule.parse({}),
};

type StorageChanges<T extends object> = {
    [K in keyof T]?: {
        oldValue: T[K];
        newValue: T[K];
    };
};

/**
 * The `StorageC` class is a singleton that manages the storage of application settings.
 * It provides methods to save, load, reset, synchronize, upload, and download settings
 * from both local and remote browser storage. The class ensures that settings are
 * validated, compressed, and decompressed as needed, and it handles changes to storage
 * in real-time. It also supports draft management for rules and modules.
 *
 * Key Features:
 * - Singleton pattern to ensure a single instance of the storage manager.
 * - Reactive settings management with support for default values.
 * - Local and remote storage synchronization with conflict resolution.
 * - Compression and chunking of settings for efficient remote storage.
 * - Automatic handling of storage changes via event listeners.
 * - Validation of settings using schemas.
 * - Draft management for temporary rule and module storage.
 *
 * Usage:
 * - Use `StorageC.getInstance()` to access the singleton instance.
 * - Call methods like `save()`, `load()`, `reset()`, `upload()`, and `download()` to manage settings.
 * - Use `hasChanged()` to check for unsaved changes and `revert()` to undo changes.
 * - Handle drafts with `getDraft()` and `newDraft()`.
 *
 * Example:
 * ```typescript
 * const storage = StorageC.getInstance();
 * await storage.load();
 * storage.current.someSetting = 'newValue';
 * await storage.save();
 * ```
 */
class StorageC {
    private static instance?: Storage;
    public static getInstance(): Storage {
        if (!StorageC.instance) StorageC.instance = new StorageC() as Storage;
        return StorageC.instance;
    }
    private constructor() {
        this.load();

        browser.storage.local.onChanged.addListener(this.onLocalChanged.bind(this));
        // browser.storage.sync.onChanged.addListener(this.onSyncChanged.bind(this));

        Logger.debug('Settings', this);

        return new Proxy(this, {
            get(target, p) {
                if (Object.hasOwn(target.current, p)) return target.current[p as keyof StorageT];
                return (target as any)[p];
            },
        });
    }

    public current: StorageT = reactive(DEFAULT_SETTINGS());
    private saved: StorageT = DEFAULT_SETTINGS();
    private remoteInfo: RemoteSettingsInfo = DEFAULT_REMOTE_INFO();

    /**
     * Saves the current settings to browser local storage.
     * Updates the modification timestamp and persists the settings object.
     * Uses JSON serialization to ensure proper array handling in storage.
     */
    public async save(): Promise<void> {
        this.current.info.updated = Date.now();
        // JSON parse and stringify due to conversion of empty array proxy to object instead of array
        this.saved = JSON.parse(JSON.stringify(this.current));
        await browser.storage.local.set(this.clean(this.saved));
        Logger.info('Settings saved.');
    }

    /**
     * Loads settings from browser local storage and synchronizes them with the current state.
     * If no settings exist in storage, saves the default current settings.
     * @throws {Error} If parsing the stored settings fails validation
     */
    public async load(): Promise<void> {
        this.saved = this.parse(await browser.storage.local.get());
        Object.assign(this.current, this.saved);

        if (!(await browser.storage.local.getBytesInUse())) this.save();
    }

    /**
     * Resets all settings to their default values and persists the changes.
     * @returns A promise that resolves when the settings have been saved.
     */
    public async reset(): Promise<void> {
        Object.assign(this.current, DEFAULT_SETTINGS);
        await this.save();
    }

    /**
     * Check if the settings have changed.
     * @returns A boolean that indicates whether the parameters have changed.
     */
    public hasChanged(): boolean {
        return JSON.stringify(this.saved) !== JSON.stringify(this.current);
    }

    /**
     * Reverts the current settings to their previously saved state.
     * This function replaces the properties of the `current` object
     * with the properties of the `saved` object.
     */
    public revert(): void {
        Object.assign(this.current, this.saved);
    }

    /**
     * Synchronizes remote settings information from browser storage.
     * @returns A promise that resolves to `true` if the remote info was updated, `false` otherwise.
     * @throws {Error} If parsing the stored settings fails validation
     */
    public async syncInfo(): Promise<boolean> {
        const lastUpdated = this.remoteInfo.updated;
        this.remoteInfo = zRemoteSettingsInfo.parse((await browser.storage.sync.get<RemoteSettings>('info')).info);
        return lastUpdated !== this.remoteInfo.updated;
    }

    /**
     * Uploads the local settings to remote storage after compression.
     * @param force - If true, uploads regardless of remote modification time. If false, throws an error if remote data is more recent than local data. Defaults to false.
     * @throws {StorageRemoteMoreRecentError} When force is false and remote data is more recent than local data.
     * @returns A promise that resolves when the upload is complete.
     */
    public async upload(force: boolean = false): Promise<void> {
        await this.syncInfo();
        if (!force && this.saved.info.updated < this.remoteInfo.updated) throw StorageRemoteMoreRecentError;

        const chunks = await this.compress(this.saved);
        await browser.storage.sync.set({
            ...Object.fromEntries(chunks.map((chunk, index) => [index, chunk])),
            info: {
                chunkLength: chunks.length,
                updated: Date.now(),
            },
        });
    }

    /**
     * Downloads settings from remote storage and updates local settings.
     *
     * @param force - If true, forces download even if local settings are more recent. Defaults to false.
     * @throws {StorageLocalMoreRecentError} When force is false and local settings are more recent than remote settings.
     * @returns A promise that resolves when the download and save operations are complete.
     */
    public async download(force: boolean = false): Promise<void> {
        await this.syncInfo();
        if (!force && this.saved.info.updated > this.remoteInfo.updated) throw StorageLocalMoreRecentError;

        const chunks = Object.values(await browser.storage.sync.get([...Array(this.remoteInfo.chunkLength).keys()]));
        Object.assign(this.current, this.parse(await decompress(chunks.join(''))));
        await this.save();
    }

    /**
     * Handles changes to local storage settings and updates the current settings state.
     *
     * @param changes - An object containing the changed storage items, where each key maps to a StorageChange object with newValue and oldValue properties.
     * @returns A promise that resolves when the settings have been updated.
     * @throws Logs an error if parsing the settings from the storage change fails, but does not throw.
     */
    public async onLocalChanged(changes: { [key: string]: Browser.storage.StorageChange }): Promise<void> {
        Logger.debug('Local settings changed:', changes);
        try {
            Object.assign(
                this.current,
                Object.fromEntries(
                    Object.entries(changes as StorageChanges<StorageT>).map(([key, change]) => [key, change.newValue]),
                ),
            );
            this.saved = this.current;
        } catch (error) {
            Logger.error('Failed to parse settings from storage change:', error);
        }
    }

    /**
     * Handles changes to synchronized settings from browser storage.
     * Retrieves the updated remote settings, decompresses the chunked data,
     * parses it according to the settings schema, and updates the local remote
     * settings object. Logs any errors that occur during parsing.
     * @throws Catches and logs errors during decompression or schema parsing
     */
    // public async onSyncChanged(): Promise<void> {}

    /**
     * Cleans the provided settings object by filtering out unsynchronized rules and modules.
     * For modules that have both `src` and `content` properties, the `content` property is cleared.
     *
     * @param settings - The settings object to be cleaned.
     * @param sync - Remove rules and modules that should not be synchronized.
     * @returns A new settings object with only synchronized rules and modules.
     */
    private clean(settings: StorageT, sync: boolean = false): StorageT {
        const cleaned: any = JSON.parse(JSON.stringify(settings)) as StorageT;

        if (sync) {
            cleaned.rules = cleaned.rules.filter((rule: Rule) => rule.sync);
            cleaned.modules = cleaned.modules.filter((module: Module) => module.sync);
        }

        cleaned.rules = cleaned.rules.map((rule: Rule) => {
            cleaned['r:' + rule.id] = rule;
            return 'r:' + rule.id;
        });
        cleaned.modules = cleaned.modules.map((module: Module) => {
            if ('src' in module && module.src && module.content) module.content = '';
            cleaned['m:' + module.id] = module;
            return 'm:' + module.id;
        });
        for (let draft of Object.values(Draft)) {
            if (!cleaned.drafts[draft]) continue;
            const key = draft.slice(0, 1) + ':' + cleaned.drafts[draft].id;
            cleaned[key] = cleaned.drafts[draft];
            cleaned.drafts[draft] = key;
        }

        return cleaned;
    }

    /**
     * Parses the provided settings object, transforming its `rules` and `modules` properties
     * into arrays of their respective objects while removing the corresponding keys from the
     * original settings object. The resulting settings object is then validated using `zSettings`.
     *
     * @param settings - A record containing the settings to be parsed. The `rules` and `modules`
     * properties are expected to be arrays of string IDs, which are used to look up their
     * corresponding `Rule` or `Module` objects in the same record.
     *
     * @returns The parsed and validated settings object of type `SettingsT`.
     *
     * @throws Will throw an error if the validation with `zSettings` fails.
     */
    private parse(settings: Record<string, any>): StorageT {
        for (let list of ['rules', 'modules']) {
            if (settings[list]?.length)
                settings[list] = (settings[list] as string[])
                    .map((key: string) => {
                        const element = settings[key];
                        if (!element) return null;
                        delete settings[key];
                        return element;
                    })
                    .filter(Boolean);
        }
        for (let draft of Object.values(Draft)) {
            if (!settings.drafts?.[draft]) continue;
            const key = settings.drafts[draft];
            settings.drafts[draft] = settings[key];
            delete settings[key];
        }

        return zStorage.parse(settings);
    }

    /**
     * Compresses the provided settings object into a series of string chunks.
     *
     * This method first cleans the input settings, compresses the cleaned data,
     * and then splits the compressed result into chunks of up to 4096 characters.
     *
     * @param settings - The settings object to be compressed.
     * @returns A promise that resolves to an array of string chunks, each representing
     *          a portion of the compressed data.
     */
    private async compress(settings: StorageT): Promise<string[]> {
        const cleaned = this.clean(settings, true);
        const compressed = await compress(cleaned);
        const chunks = [];
        let i = 0;
        while (i < compressed.length) chunks.push(compressed.slice(i, (i += 4096)));

        return chunks;
    }

    /**
     * Retrieves a draft from the current drafts collection. If the specified draft does not exist,
     * a new draft is created and returned.
     *
     * @param draft - The draft to retrieve. This can be of type `Draft`.
     * @returns The retrieved or newly created draft, which can be of type `Rule` or `Module`.
     */
    public getDraft(draft: Draft.Rule): Rule;
    public getDraft(draft: Draft.Module): Module;
    public getDraft(draft: Draft): Rule | Module {
        return this.current.drafts[draft] || this.newDraft(draft as any);
    }

    /**
     * Creates a new draft and adds it to the current drafts storage.
     *
     * @param draft - The type of draft to create. Must be a key of the `DEFAULT_DRAFT` object.
     * @param force - Optional. If `true`, forces the creation of the draft even if it already exists. Defaults to `false`.
     * @returns The newly created draft, which can be either a `Rule` or a `Module`.
     * @throws `StorageDraftExistsError` if the draft already exists and `force` is not set to `true`.
     */
    public newDraft(draft: Draft.Rule, force?: boolean): Rule;
    public newDraft(draft: Draft.Module, force?: boolean): Module;
    public newDraft(draft: Draft, force: boolean = false): Rule | Module {
        if (!force && this.hasDraft(draft)) throw StorageDraftExistsError;
        return (this.current.drafts[draft] = DEFAULT_DRAFT[draft]() as any);
    }

    public hasDraft(draft: Draft): boolean {
        return !!this.current.drafts[draft];
    }
}

export const Storage = StorageC;
export type Storage = StorageC & StorageT;
