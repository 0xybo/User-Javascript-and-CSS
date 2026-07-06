import tailwindcss from '@tailwindcss/vite';
import VitePluginVueDevTools from 'vite-plugin-vue-devtools';
import type { ConfigEnv, WxtViteConfig } from 'wxt';

export function buildViteConfig(configEnv: ConfigEnv): WxtViteConfig {
    const { browser } = configEnv;

    const config: WxtViteConfig = {
        plugins: [
            tailwindcss(),
            // monaco({ browser: browser as 'chrome' | 'firefox' }),
            VitePluginVueDevTools({
                appendTo: '/entrypoints/options/main.ts',
            }),
        ],
        define: {
            __DEV__: true,
        },
        server: {
            watch: {
                ignored: [
                    '**/node_modules/**',
                    '**/.git/**',
                    '**/*.md',
                    '**/dist/**',
                    '**/resources/**',
                ],
            },
        },
        build: {
            rollupOptions: {
                // TODO: Remove when updating vueuse beyond v14.3.0
                onwarn(warning, warn) {
                    if (warning.code === 'INVALID_ANNOTATION') return;
                    warn(warning);
                },
            },
        },
        optimizeDeps: {
            exclude: ['monaco-editor'],
        },
    };

    return config;
}
