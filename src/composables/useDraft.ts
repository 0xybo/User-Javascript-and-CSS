import { IDraft, IItem, ItemType } from '@/lib/storage/types';
import { useStorage } from './useStorage';

/**
 * A composable function that provides a reactive draft object for a given item or item type.
 * It allows you to create or retrieve a draft for a specific rule, module, or other item types.
 * The draft can be used to track changes before saving them to the storage.
 *
 * @param item - The item for which to create or retrieve a draft. It can be an instance of IRule
 * or IModule.
 * @returns A reactive draft object corresponding to the provided item or item type.
 */
export function useDraft<TItem extends IItem>(item: TItem): IDraft<TItem>;
/**
 * A composable function that provides a reactive draft object for a given item type.
 * It allows you to create or retrieve a draft for a specific item type (e.g., rule, module).
 * The draft can be used to track changes before saving them to the storage.
 *
 * @param type - The item type for which to create or retrieve a draft.
 * @returns A reactive draft object corresponding to the provided item type.
 */
export function useDraft<TType extends ItemType>(type: TType): IDraft<TType>;
export function useDraft(obj: IItem | ItemType): IDraft {
    const storage = useStorage();

    if (typeof obj === 'string')
        return storage.getDraftNewFromType(obj) || storage.createDraftFromType(obj);

    return storage.getDraftFromItem(obj) || storage.createDraftFromItem(obj);
}
