import { DraftT, ItemT, ItemType, ModuleT } from '@/lib/storage/types';
import { isRule } from '@/lib/storage/utils';
import { useStorage } from './useStorage';

export function useDraft<TItem extends ItemT>(item: TItem): DraftT<TItem>;
export function useDraft<TType extends ItemType>(type: TType): DraftT<TType>;
export function useDraft(obj: ItemT | ItemType): DraftT {
    const storage = useStorage();

    if (typeof obj === 'string')
        return storage.getDraftNewFromType(obj) || storage.createDraftFromType(obj);

    return storage.getDraftFromItem(obj) || storage.createDraftFromItem(obj);
}

export function hasChanged(draft: DraftT): boolean {
    return isRule(draft)
        ? draft.files[draft.item.script.id] !== draft.item.script.content ||
              draft.files[draft.item.style.id] !== draft.item.style.content
        : (draft.item as ModuleT).files.some((file) => file.content !== draft.files[file.id]);
}
