import { defineStorageStore } from '@/lib/storage';
import { EditorT } from '@/lib/storage/editor';
import { RuleT, SettingsT } from '@/lib/storage/types';

export const useStorage = defineStorageStore();

export function useRules(): RuleT[] {
    const storage = useStorage();
    return storage.rules;
}

export function useSettings(): SettingsT {
    const storage = useStorage();
    return storage.settings;
}

export function useEditorSettings<T extends EditorT>(): T {
    const settings = useSettings();
    return settings.editor as T;
}
