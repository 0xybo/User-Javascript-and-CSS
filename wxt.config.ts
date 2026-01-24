import tailwindcss from '@tailwindcss/vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import { defineConfig } from 'wxt';
import { monaco } from './config/monaco';

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-vue', '@wxt-dev/i18n/module'],
    webExt: {
        disabled: true,
    },
    manifest: {
        optional_host_permissions: ['*://*/*'],
        host_permissions: ['http://*/*', 'https://*/*'],
        permissions: ['storage', 'tabs', 'unlimitedStorage', 'userScripts', 'scripting'],
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
    },
    srcDir: 'src',
    outDir: 'dist',
    publicDir: 'src/public',
    targetBrowsers: ['firefox', 'chrome'],
    vite: () => ({
        plugins: [
            tailwindcss(),
            monaco(),
            vueDevTools({
                appendTo: '/entrypoints/options/main.ts',
            }),
        ],
        define: {
            __DEV__: true,
        },
    }),
    imports: false,
});
