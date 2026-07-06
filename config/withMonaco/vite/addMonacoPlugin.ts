import type { ConfigEnv } from 'wxt';
import type { MonacoOptions, ViteConfigBuilder } from '../types';
import { monaco } from './plugin';

export function addMonacoPlugin(
    builder: ViteConfigBuilder,
    options: MonacoOptions,
): ViteConfigBuilder {
    return (config: ConfigEnv) => {
        const viteConfig = builder(config);
        viteConfig.plugins = [...(viteConfig.plugins || []), monaco(options)];
        return viteConfig;
    };
}
