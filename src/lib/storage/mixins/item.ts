import { ItemT } from '../types';
import { isRule } from '../utils';
import type { StorageServiceDrafts } from './draft';

export function StorageServiceItemMixin(Base: StorageServiceDrafts) {
    return class StorageServiceItem extends Base {
        /**
         * Removes the specified item (rule or module) from the storage, along with any associated drafts.
         *
         * @param item The item to remove.
         */
        removeItem(item: ItemT) {
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
        getItemFromId(id: string): ItemT | null {
            return (
                this.rules.find((rule) => rule.id === id) ??
                this.modules.find((module) => module.id === id) ??
                null
            );
        }
    };
}

export type StorageServiceItem = ReturnType<typeof StorageServiceItemMixin>;
