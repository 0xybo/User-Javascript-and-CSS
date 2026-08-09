import { IItem } from '../types';
import { isRule } from '../utils';
import type { StorageServiceDrafts } from './draft';

/**
 * Mixin that adds item-related functionality to the storage service, including methods for
 * removing items and retrieving items by ID.
 *
 * @param Base - The base class to extend with item-related functionality.
 * @returns A new class that extends the base class with item-related methods.
 */
export function StorageServiceItemMixin<T extends StorageServiceDrafts>(Base: T) {
    return class StorageServiceItem extends Base {
        /**
         * Removes the specified item (rule or module) from the storage, along with any associated
         * drafts.
         *
         * @param item The item to remove.
         */
        removeItem(item: IItem) {
            const list = isRule(item) ? this.rules : this.modules;
            const index = list.findIndex((i) => i.id === item.id);
            if (index >= 0) list.splice(index, 1);
            const draft = this.getDraftFromItem(item);
            if (draft) this.removeDraft(draft);
        }

        /**
         * Retrieves an item (rule or module) corresponding to the specified item ID, if it exists.
         *
         * @param id The ID of the item to retrieve.
         * @returns The corresponding item, or null if no item exists for the specified ID.
         */
        getItemFromId(id: string): IItem | null {
            return (
                this.rules.find((rule) => rule.id === id) ??
                this.modules.find((module) => module.id === id) ??
                null
            );
        }
    };
}

/**
 * Type representing the storage service with item-related functionality, including methods for
 * removing items and retrieving items by ID.
 */
export type StorageServiceItem = ReturnType<typeof StorageServiceItemMixin>;
