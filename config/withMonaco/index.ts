import type { UserConfig } from 'wxt';
import type { MonacoOptions, ViteConfigBuilder } from './types';
import { updateConfig } from './vite/updateConfig';

export function withMonaco(config: UserConfig, options: MonacoOptions): UserConfig {
    config.vite = updateConfig(config.vite as ViteConfigBuilder, options);

    return config;
}
