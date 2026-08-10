import type { ConfigEnv, UserManifest } from 'wxt';

/**
 * MarkAsPresent utility type ensures that specified keys in a type are treated as required, even if they are optional in the original type. This is useful for avoiding TypeScript errors when certain properties are expected to be present in an object.
 *
 * Example usage:
 * ```ts
 * const manifest: UserManifest = {};
 * manifest.permissions.push('storage');
 * //                  ^ TypeScript error: Property 'permissions' is possibly 'undefined'.
 *
 * const manifest2: MarkAsPresent<UserManifest, 'permissions'> = {};
 * manifest2.permissions.push('storage'); // No TypeScript error, 'permissions' is treated as required.
 * ```
 */
type MarkAsPresent<T, K extends keyof T = keyof T> = T & { [P in K]-?: T[P] };

export function buildManifest({ browser }: ConfigEnv): UserManifest {
    const isChrome = browser === 'chrome';

    const manifest: MarkAsPresent<UserManifest, 'optional_permissions' | 'permissions'> = {
        optional_host_permissions: ['*://*/*'],
        host_permissions: ['http://*/*', 'https://*/*'],
        permissions: [
            'storage',
            'tabs',
            'unlimitedStorage',
            'scripting',
            'alarms',
            'notifications',
        ],
        browser_specific_settings: {
            gecko: {
                id: '@userjavascriptandcss',
                data_collection_permissions: {
                    required: ['none'],
                },
            },
        },
        optional_permissions: [],
        default_locale: 'en',
        name: '__MSG_EXTENSION_NAME__',
        description: '__MSG_EXTENSION_DESCRIPTION__',
        icons: {
            16: 'icon/16.png',
            32: 'icon/32.png',
            48: 'icon/48.png',
            96: 'icon/96.png',
            128: 'icon/128.png',
        },
    };

    if (isChrome) {
        manifest.permissions.push('userScripts');
    } else {
        manifest.optional_permissions.push('userScripts');
    }

    return manifest;
}
