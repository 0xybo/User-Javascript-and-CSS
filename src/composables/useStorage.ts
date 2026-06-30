import { storage } from '@/lib/storage';
import { EditorT } from '@/lib/storage/editor';
import { RuleT, SettingsT } from '@/lib/storage/types';

export const useStorage = () => storage;

export function useRules(): RuleT[] {
    return storage.rules;
}

export function useSettings(): SettingsT {
    return storage.settings;
}

export function useEditorSettings<T extends EditorT>(): T {
    return storage.settings.editor as T;
}
