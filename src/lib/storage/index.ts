import { Logger } from '../logger';
import { type Constructor } from '../utils';
import { StorageServiceBase } from './base';
import { StorageServiceDraftsMixin } from './mixins/draft';
import { StorageServiceItemMixin } from './mixins/item';
import { StorageServiceSyncMixin } from './mixins/sync';

/**
 * Applies a series of mixins to the base StorageService class, enhancing it with additional functionality for synchronization, draft management, and item management.
 *
 * @param Base The base class to which the mixins will be applied. This should be a constructor function that creates instances of StorageServiceBase.
 * @returns A new class that extends the base class with the added functionality from the mixins.
 */
function applyMixins(Base: Constructor<StorageServiceBase>) {
    let StorageServiceSync = StorageServiceSyncMixin(Base);
    let StorageServiceDrafts = StorageServiceDraftsMixin(StorageServiceSync);
    let StorageServiceItem = StorageServiceItemMixin(StorageServiceDrafts);
    return StorageServiceItem;
}

/**
 * A service class that manages the storage of rules, modules, drafts, and settings. It provides methods to load, save, reset, and synchronize data with remote storage.
 */
export class StorageService extends applyMixins(StorageServiceBase) {}

/**
 * An instance of the StorageService class that manages the storage of rules, modules, drafts, and settings. This instance is used throughout the application to interact with the storage.
 */
export const storage = new StorageService();

storage.load().catch((e) => Logger.error('Failed to load storage:', e));
