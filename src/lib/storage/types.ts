import z from 'zod';
import {
    zDraft,
    zFile,
    zInfo,
    zModule,
    zRemoteSettingsInfo,
    zRule,
    zSettings,
    zStorage,
} from './schema';

/**
 * Enumerates the possible sorting options for items in the storage.
 */
export enum SortBy {
    NameDescending = 'name_desc',
    NameAscending = 'name_asc',
    Created = 'created',
    Updated = 'updated',
}

/**
 * Enumerates the possible types of items that can be stored in the storage.
 */
export enum ItemType {
    Rule = 'rule',
    Module = 'module',
}

/**
 * Enumerates the possible types of files that can be stored in the storage.
 */
export enum FileType {
    Typescript = 'typescript',
    Javascript = 'javascript',
    Css = 'css',
    Scss = 'scss',
}

/**
 * Represents the structure of a file in the storage system, including its name, type, and content.
 */
export type IFile = z.infer<typeof zFile>;

/**
 * Represents the structure of an item in the storage system, which can be either a rule or a module.
 */
export type IItem = IRule | IModule;

/**
 * Represents the structure of a module in the storage system, including its properties and associated files.
 */
export type IModule = z.infer<typeof zModule>;

/**
 * Represents the structure of a rule in the storage system, including its properties and associated script and style files.
 */
export type IRule = z.infer<typeof zRule>;

/**
 * Represents the structure of the information stored in the storage system, including metadata and other relevant details.
 */
export type IInfo = z.infer<typeof zInfo>;

/**
 * Represents the structure of the settings stored in the storage system, including configuration options and preferences.
 */
export type ISettings = z.infer<typeof zSettings>;

/**
 * Represents the structure of a draft in the storage system, which can be created from an item or an item type. Drafts are used for temporary changes before they are saved to the main storage.
 */
export type IDraft<TItem extends IItem | ItemType = IItem> = z.infer<typeof zDraft> & {
    /** The item associated with this draft. */
    item: TItem extends ItemType ? (TItem extends ItemType.Rule ? IRule : IModule) : TItem;
};

/**
 * Represents the structure of the entire storage system, including all items, drafts, settings, and information.
 */
export type IStorage = z.infer<typeof zStorage>;

/**
 * Represents the structure of the information related to remote storage settings, including metadata and other relevant details.
 */
export type RemoteSettingsInfo = z.infer<typeof zRemoteSettingsInfo>;

/**
 * Represents the structure of the remote storage settings, which includes chunks of data and associated information.
 */
export type RemoteSettings = {
    [chunkIndex: number]: string;
    info: RemoteSettingsInfo;
};

/**
 * Represents the structure of the changes made to the storage, where each key corresponds to a property in the storage and contains the old and new values for that property.
 */
export type StorageChanges<T extends object> = {
    [K in keyof T]?: {
        oldValue: T[K];
        newValue: T[K];
    };
};

/**
 * On-disk format for rules (content stored separately in f:<UUID> keys).
 */
export type RuleStored = Omit<IRule, 'script' | 'style'> & {
    scriptId: string;
    styleId: string;
};

/**
 * On-disk format for modules (files stored separately in f:<UUID> keys).
 */
export type ModuleStored = Omit<IModule, 'files'> & {
    fileIds: string[];
};

/**
 * On-disk format for drafts (files stored separately in d:<UUID> keys).
 */
export type DraftStored = {
    isNew: boolean;
    itemId: string;
    itemType: ItemType;
    fileIds: string[];
};
