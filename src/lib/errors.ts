export class StorageError extends Error {
    message = 'An error occurred while handling the extension storage.';
}
export class StorageRemoteMoreRecentError extends StorageError {
    message = 'Remote settings are newer than local settings.';
}
export class StorageLocalMoreRecentError extends StorageError {
    message = 'Local settings are newer than remote settings.';
}
export class StorageDraftExistsError extends StorageError {
    message = 'A draft already exists.';
}
export class StorageNewDraftNotFoundError extends StorageError {
    message = 'No new draft found in the storage.';
}
export class StorageInvalidSyncData extends StorageError {
    message = 'Data retrieves from the sync storage is invalid.';
}
