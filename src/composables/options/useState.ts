import { computed, MaybeRef, ref, unref, watch } from '#imports';
import { Tab } from '@/lib/options';
import { Panel } from '@/lib/options/panel';
import { DraftT, ItemType } from '@/lib/storage/types';
import { isRule } from '@/lib/storage/utils';
import { defineStore } from 'pinia';
import { hasChanged, useDraft } from '../useDraft';
import { useStorage } from '../useStorage';

const TYPES: Record<string, ItemType> = {
    r: ItemType.Rule,
    m: ItemType.Module,
};

export const useState = defineStore('state', () => {
    const storage = useStorage();

    const tab = ref<Tab | null>(Tab.Rules);
    const rule = ref(useDraft(ItemType.Rule));
    const module = ref(useDraft(ItemType.Module));
    const panel = ref<Panel>(Panel.Rule);
    const ruleChanged = computed(() => hasChanged(rule.value));
    const moduleChanged = computed(() => hasChanged(module.value));

    watch(
        () => storage.loaded,
        () => {
            const [typeLetter, id] = location.hash.slice(1).split(':');
            if (!typeLetter || !id) return void (location.hash = '');
            const type = TYPES[typeLetter];
            if (!type) return void (location.hash = '');

            let draft = storage.drafts.find((d) => d.item.id === id);
            if (!draft) {
                const list = type === ItemType.Rule ? storage.rules : storage.modules;
                const item = list.find((i) => i.id === id);
                if (item) draft = useDraft(item);
            }
            if (!draft) return void (location.hash = '');

            if (type === ItemType.Rule) {
                if (draft) rule.value = draft;
                else rule.value = draft;
            } else {
                if (draft) module.value = draft;
                else module.value = draft;
            }
        },
        { once: true },
    );

    function watchOnceForSave(draft: MaybeRef<DraftT>) {
        const noRefDraft = unref(draft);
        watch(
            noRefDraft.item,
            () => {
                storage.saveDraft(noRefDraft);
                location.hash = noRefDraft.item.type.at(0) + ':' + noRefDraft.item.id;
            },
            { once: true },
        );
    }

    watchOnceForSave(rule);
    watchOnceForSave(module);

    function switchDraft(draft: DraftT) {
        let oldDraft: DraftT;
        if (isRule(draft)) {
            oldDraft = rule.value;
            rule.value = draft;
            watchOnceForSave(rule);
            tab.value = Tab.Rules;
        } else {
            oldDraft = module.value;
            module.value = draft;
            watchOnceForSave(module);
            tab.value = Tab.Modules;
        }

        if (!hasChanged(oldDraft)) storage.removeDraft(oldDraft);

        location.hash = draft.item.type.at(0) + ':' + draft.item.id;
    }

    return {
        tab,
        rule,
        ruleChanged,
        module,
        moduleChanged,
        panel,
        switchDraft,
    };
});
