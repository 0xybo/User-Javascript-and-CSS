import { Rule, Settings, Storage } from '@/lib/storage';

export function useStorage(): Storage {
    return Storage.getInstance();
}

export function useRules(): Rule[] {
    const storage = useStorage();
    return storage.rules;
}

export function useSettings(): Settings {
    const storage = useStorage();
    return storage.settings;
}
