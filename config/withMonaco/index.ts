import type { UserConfig } from 'wxt';
import type { MonacoOptions, ViteConfigBuilder } from './types';
import { addMonacoPlugin } from './vite/addMonacoPlugin';

export function withMonaco(config: UserConfig, options: MonacoOptions): UserConfig {
    config.vite = addMonacoPlugin(config.vite as ViteConfigBuilder, options);

    return config;
}
