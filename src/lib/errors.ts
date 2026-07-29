/**
 * Base class for storage-related errors.
 */
export class StorageError extends Error {
    message = 'An error occurred while handling the extension storage.';
}

/**
 * Error indicating that the remote settings are newer than the local settings.
 */
export class StorageRemoteMoreRecentError extends StorageError {
    message = 'Remote settings are newer than local settings.';
}

/**
 * Error indicating that the local settings are newer than the remote settings.
 */
export class StorageLocalMoreRecentError extends StorageError {
    message = 'Local settings are newer than remote settings.';
}

/**
 * Error indicating that the data retrieved from the sync storage is invalid.
 */
export class StorageDraftExistsError extends StorageError {
    message = 'A draft already exists.';
}

/**
 * Error indicating that no new draft was found in the storage.
 */
export class StorageNewDraftNotFoundError extends StorageError {
    message = 'No new draft found in the storage.';
}

/**
 * Error indicating that the data retrieved from the sync storage is invalid.
 */
export class StorageInvalidSyncData extends StorageError {
    message = 'Data retrieves from the sync storage is invalid.';
}
