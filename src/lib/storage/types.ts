import { Ref } from '#imports';
import { Reactive } from 'vue';
import z from 'zod';
import {
    zDraft,
    zFile,
    zInfo,
    zModule,
    zRemoteSettingsInfo,
    zRule,
    zScript,
    zSettings,
    zStorage,
    zStyle,
} from './schema';

export enum SortBy {
    NameDescending = 'name_desc',
    NameAscending = 'name_asc',
    Created = 'created',
    Updated = 'updated',
}

export enum ItemType {
    Rule = 'rule',
    Module = 'module',
}

export enum FileType {
    Style = 'scss',
    Script = 'ts',
}

export type FileT = z.infer<typeof zFile>;

export type ScriptT = z.infer<typeof zScript>;

export type StyleT = z.infer<typeof zStyle>;

export type ItemT = RuleT | ModuleT;

export type ModuleT = z.infer<typeof zModule>;

export type RuleT = z.infer<typeof zRule>;

export type InfoT = z.infer<typeof zInfo>;

export type SettingsT = z.infer<typeof zSettings>;

export type DraftT<TItem extends ItemT | ItemType = ItemT> = z.infer<typeof zDraft> & {
    item: TItem extends ItemType ? (TItem extends ItemType.Rule ? RuleT : ModuleT) : TItem;
};

export type StorageT = z.infer<typeof zStorage>;

export type RemoteSettingsInfo = z.infer<typeof zRemoteSettingsInfo>;

export type RemoteSettings = {
    [chunkIndex: number]: string;
    info: RemoteSettingsInfo;
};

export type StorageChanges<T extends object> = {
    [K in keyof T]?: {
        oldValue: T[K];
        newValue: T[K];
    };
};

export interface StorageStoreBase {
    info: Reactive<InfoT>;
    settings: Reactive<SettingsT>;
    rules: Reactive<RuleT[]>;
    modules: Reactive<ModuleT[]>;
    drafts: Reactive<DraftT[]>;
    loaded: Ref<boolean>;

    current: () => StorageT;

    load: () => Promise<void>;
    save: () => Promise<void>;
    reset: () => Promise<void>;
    upload: () => Promise<void>;
    download: () => Promise<void>;
}

export interface StorageStoreDraft extends StorageStoreBase {
    createDraftFromItem: <TItem extends ItemT>(item: TItem) => Reactive<DraftT<TItem>>;
    createDraftFromType: <TType extends ItemType>(type: TType) => Reactive<DraftT<TType>>;
    discardDraft: (draft: DraftT) => void;
    saveDraft: (draft: DraftT) => void;
    getDraftFromItem: <TItem extends ItemT>(item: TItem) => DraftT<TItem> | null;
    getDraftNewFromType: <TType extends ItemType>(type: TType) => DraftT<TType> | null;
    clearDrafts: () => void;
    removeDraft: (draft: DraftT) => void;
}

export interface StorageStoreItem extends StorageStoreDraft {
    removeItem: (item: ItemT) => void;
}
