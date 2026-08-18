import { browser } from '#imports';
import { type JSONObject } from '@/types/json';
import { decompress as _decompress } from '../../compression';
import {
    StorageInvalidSyncData,
    StorageLocalMoreRecentError,
    StorageRemoteMoreRecentError,
} from '../../errors';
import { deepMerge, type Constructor } from '../../utils';
import type { StorageServiceBase } from '../base';
import { RemoteSettings, RemoteSettingsInfo } from '../types';
import { compress, parse } from '../utils';

/**
 * Mixin that adds synchronization functionality to the storage service, including methods for
 * uploading and downloading storage data to and from remote storage.
 *
 * @param Base - The base class to extend with synchronization functionality.
 * @returns A new class that extends the base class with synchronization methods.
 */
export function StorageServiceSyncMixin<T extends Constructor<StorageServiceBase>>(Base: T) {
    class _StorageServiceSync extends Base {
        /**
         * Synchronizes the local storage information with the remote storage information. This method retrieves the last updated timestamp from the remote storage and updates the local remoteInfo accordingly.
         *
         * @returns A boolean indicating whether the remote storage information has changed since the last synchronization.
         */
        private async _syncInfo() {
            const lastUpdated = this.remoteInfo.updated;
            const remote = (await browser.storage.sync.get<RemoteSettings>('info')).info;
            Object.assign(this.remoteInfo, remote);
            return lastUpdated !== this.remoteInfo.updated;
        }

        /**
         * Fetches the current remote storage information and returns it. The returned information
         * is also stored on the instance, so subsequent calls on this service reflect the latest
         * known state of the remote storage.
         *
         * @returns The current remote storage information.
         */
        async getRemoteInfo(): Promise<RemoteSettingsInfo> {
            await this._syncInfo();
            return this.remoteInfo;
        }

        /**
         * Computes the approximate number of bytes that uploading the current (synced) data would
         * consume in the `storage.sync` area. This is derived from the length of the compressed
         * Base64 chunks: each 4 characters encode 3 bytes.
         *
         * @returns The estimated size in bytes of the compressed sync payload.
         */
        async getZipSize(): Promise<number> {
            const chunks = await compress(this.current);
            return Math.ceil((chunks.join('').length * 3) / 4);
        }

        /**
         * Uploads the current storage state to the remote storage. This method compresses the storage data and saves it to the remote storage, replacing any existing data.
         *
         * @param force Whether to force the upload even if the local storage is older than the remote storage (default: false).
         * @throws StorageRemoteMoreRecentError if the local storage is older than the remote storage and force is false.
         */
        async upload(force = false) {
            await this._syncInfo();
            if (!force && this.info.updated < this.remoteInfo.updated) {
                throw StorageRemoteMoreRecentError;
            }

            const chunks = await compress(this.current);
            await browser.storage.sync.clear();
            await browser.storage.sync.set({
                ...Object.fromEntries(chunks.map((c, i) => [i, c])),
                info: {
                    chunkLength: chunks.length,
                    updated: Date.now(),
                    emitter: this.info.emitter,
                },
            });
        }

        /**
         * Downloads the storage state from the remote storage and merges it into the local
         * storage. This method retrieves the compressed storage data from the remote storage,
         * decompresses it, and updates the local storage accordingly.
         *
         * @param force Whether to force the download even if the local storage is newer than the
         * remote storage (default: false).
         * @throws StorageLocalMoreRecentError if the local storage is newer than the remote
         * storage and force is false.
         * @throws StorageInvalidSyncData if the retrieved data from the remote storage is invalid
         * or cannot be parsed.
         */
        async download(force = false) {
            await this._syncInfo();
            if (!force && this.info.updated > this.remoteInfo.updated) {
                throw StorageLocalMoreRecentError;
            }

            const chunks = Object.values(
                await browser.storage.sync.get([
                    ...Array(this.remoteInfo.chunkLength).keys().map(String),
                ]),
            );

            const decompressed = await _decompress(chunks.join(''));
            if (typeof decompressed !== 'object' || decompressed === null) {
                throw StorageInvalidSyncData;
            }
            const parsed = parse(decompressed as JSONObject);
            deepMerge(this.current, parsed);
            await this.save();
        }
    }

    return _StorageServiceSync as Constructor<_StorageServiceSync>;
}

/**
 * Type representing the storage service with synchronization functionality, including methods for
 * uploading and downloading storage data to and from remote storage.
 */
export type StorageServiceSync = ReturnType<typeof StorageServiceSyncMixin>;
