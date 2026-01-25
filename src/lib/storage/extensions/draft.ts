import { reactive } from '#imports';
import { clone } from '@/lib/utils';
import type { Reactive } from 'vue';
import { DraftT, ItemT, ItemType, RuleT, StorageStoreBase, StorageStoreDraft } from '../types';
import { DEFAULTS, isModule, isRule } from '../utils';

export function withDraftUtils(store: StorageStoreBase): StorageStoreDraft {
    const { drafts, modules, rules } = store;

    const createDraftFromItem = <TItem extends ItemT>(item: TItem): Reactive<DraftT<TItem>> => {
        const draft = DEFAULTS.DRAFT<TItem>();

        if (isModule(item)) {
            const module = clone(item);
            Object.assign(draft, {
                isNew: false,
                item: module,
                files: Object.fromEntries(
                    module.files.filter((f) => !f.src).map((f) => [f.id, f.content]),
                ),
            });
        } else {
            const rule = item as RuleT;
            Object.assign(draft, {
                isNew: false,
                item: rule,
                files: {
                    [rule.script.id]: rule.script.content,
                    [rule.style.id]: rule.style.content,
                },
            });
        }

        const reactiveDraft = reactive(draft);
        drafts.push(reactiveDraft);
        return reactiveDraft;
    };

    const createDraftFromType = <TType extends ItemType>(type: TType): Reactive<DraftT<TType>> => {
        const draft = DEFAULTS.DRAFT<TType>();

        if (isRule(type)) {
            const rule = draft.item as RuleT;
            draft.files = {
                [rule.script.id]: rule.script.content,
                [rule.style.id]: rule.style.content,
            };
        } else draft.item = reactive(DEFAULTS.MODULE());

        const reactiveDraft = reactive(draft);
        drafts.push(reactiveDraft);
        return reactiveDraft;
    };

    const discardDraft = (draft: DraftT) => {
        const index = drafts.findIndex((d) => d.item.id !== draft.item.id);
        if (index !== -1) drafts.splice(index, 1);
    };

    const saveDraft = (draft: DraftT) => {
        if (isRule(draft)) {
            if (draft.isNew) rules.push(draft.item);
            const rule = draft.item;
            rule.script.content = draft.files[rule.script.id];
            rule.style.content = draft.files[rule.style.id];
        } else if (isModule(draft)) {
            if (draft.isNew) modules.push(draft.item);
            const module = draft.item;
            module.files.forEach((f) => (f.content = draft.files[f.id]));
        }
        draft.isNew = false;
    };

    const getDraftFromItem = <TItem extends ItemT>(item: TItem): DraftT<TItem> | null => {
        return (drafts.find((draft) => draft.item.id === item.id) as DraftT<TItem>) ?? null;
    };

    const getDraftNewFromType = <TType extends ItemType>(type: TType): DraftT<TType> | null => {
        return (
            (drafts.find((draft) => draft.isNew && draft.item.type === type) as DraftT<TType>) ??
            null
        );
    };

    const clearDrafts = () => {
        drafts.splice(0);
    };

    const removeDraft = (draft: DraftT) => {
        const index = drafts.findIndex((d) => d.item.id === draft.item.id);
        if (index !== -1) drafts.splice(index, 1);
    };

    return {
        ...store,
        createDraftFromItem,
        createDraftFromType,
        discardDraft,
        saveDraft,
        getDraftFromItem,
        getDraftNewFromType,
        clearDrafts,
        removeDraft,
    } as const satisfies StorageStoreDraft;
}
