import { watch } from '#imports';
import { useThrottleFn } from '@vueuse/core';
import { withDraftUtils } from './extensions/draft';
import { withItemUtils } from './extensions/item';
import { StorageStoreFactory } from './setup';

export function defineStorageStore() {
    return new StorageStoreFactory()
        .extend(withDraftUtils)
        .extend(withItemUtils)
        .addPostSetupHook(async (store) => {
            if (store.loaded) return;

            await store.load();
            watch(
                [store.drafts, store.modules, store.rules, store.settings],
                useThrottleFn(store.save, 500, true),
                { deep: true },
            );
        })
        .defineStore();
}
