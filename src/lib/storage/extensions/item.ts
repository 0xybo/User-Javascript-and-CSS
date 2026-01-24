import { ItemT, StorageStoreDraft, StorageStoreItem } from '../types';
import { isRule } from '../utils';

export function withItemUtils(store: StorageStoreDraft): StorageStoreItem {
    const removeItem = (item: ItemT) => {
        const list = isRule(item) ? 'rules' : 'modules';
        const index = store[list].findIndex((i) => i.id === item.id);
        if (index >= 0) store[list].splice(index, 1);
        const draft = store.getDraftFromItem(item);
        if (draft) store.removeDraft(draft);
    };

    return {
        ...store,
        removeItem,
    };
}
