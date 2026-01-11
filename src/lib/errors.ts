class StorageError extends Error {
    message = 'An error occurred while handling the extension storage.';
}
class StorageRemoteMoreRecentError extends StorageError {
    message = 'Remote settings are newer than local settings.';
}
class StorageLocalMoreRecentError extends StorageError {
    message = 'Local settings are newer than remote settings.';
}
class StorageDraftExistsError extends StorageError {
    message = 'A draft already exists.';
}
