import { storage } from '@/lib/storage';
import { EditorT } from '@/lib/storage/editor';
import { IRule, ISettings } from '@/lib/storage/types';

export const useStorage = () => storage;

export function useRules(): IRule[] {
    return storage.rules;
}

export function useSettings(): ISettings {
    return storage.settings;
}

export function useEditorSettings<T extends EditorT>(): T {
    return storage.settings.editor as T;
}
