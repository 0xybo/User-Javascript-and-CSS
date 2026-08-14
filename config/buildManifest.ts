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

// Public key of the original "User JavaScript and CSS" extension (v3.1.2). Setting the env var
// `UJC_RESTORE_ORIGINAL_KEY=1` (e.g. `UJC_RESTORE_ORIGINAL_KEY=1 bun run build`) rebuilds the
// extension with this key so that it adopts the original extension ID and can import the data
// that the v3.1.2 extension stored under `browser.storage.local` (issue #10).
const ORIGINAL_EXTENSION_KEY =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgRLkoYUUDW9p9eBSu0/8wr6tr56i+xB3+2rAIY65FO26dBITx1bhMpk6nB0u6/TmQUk3ai3hTn3Srzmaf9FHfQiCt8R0CDENZtHICcXt1RzTEdEwFAikbHJWVRGZ4p7GqizeqO1iGQ1oj/jpxCHTee2vuYGeH1llx+CFwEWSSfN0RY5B20EXb5q3wnaYITBW6KthfQ/HZyqVTa/VfBfvGn8ZE/HEHkOpTfMXZRKL1adQBQGweJVjLU7CdDQVn09DF6QSRlN897u6ovhY+dPB18VnzwP5DjeIVGNpxr8/y+FYYZYvd2hLTi8c5OI4iIgJ2cjvsVHsUMWipA7SE0vgswIDAQAB';

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

    if (process.env.UJC_RESTORE_ORIGINAL_KEY) {
        manifest.key = ORIGINAL_EXTENSION_KEY;
    }

    if (isChrome) {
        manifest.permissions.push('userScripts');
    } else {
        manifest.optional_permissions.push('userScripts');
    }

    return manifest;
}
