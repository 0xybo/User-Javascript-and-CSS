import { Tab } from '@/lib/options';
import { Draft, Module, Rule } from '@/lib/storage';
import { defineStore } from 'pinia';
import { useStorage } from './useStorage';

export const useState = defineStore('state', () => {
    const storage = useStorage();
    const tab = ref<Tab | null>(Tab.Rules);
    const rule = ref<Rule | undefined>(storage.drafts[Draft.Rule]);
    const module = ref<Module | undefined>(storage.drafts[Draft.Module]);

    return {
        tab,
        rule,
        module,
    };
});
