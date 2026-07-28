import { copySync, existsSync } from 'fs-extra';
import { resolve } from 'path';
import type { UserConfig } from 'wxt';
import type { ViteConfigBuilder } from './withMonaco/types';

/**
 * A function that adds a Sass compiler plugin to the Vite configuration in a WXT project. This function modifies the user configuration to include a plugin that copies the `sass.worker.js` file from the `sass.js` package to the build output directory, ensuring that Sass compilation is available in the application.
 *
 * @param config The user configuration object.
 * @returns The modified user configuration object with Sass support.
 */
export function withSass(config: UserConfig): UserConfig {
    config.vite = ((builder: ViteConfigBuilder) => {
        return (viteConfig) => {
            const config = builder(viteConfig);

            config.plugins ??= [];
            config.plugins.push({
                name: 'vite-plugin-sass',
                enforce: 'pre',
                buildStart() {
                    const outputDir = this.environment.config.build?.outDir || 'dist';

                    const sassWorkerPath = resolve(
                        process.cwd(),
                        'node_modules/sass.js/dist/sass.worker.js',
                    );
                    const destPath = resolve(outputDir, 'sass.worker.js');

                    if (!existsSync(sassWorkerPath))
                        throw new Error(
                            `sass.worker.js not found at ${sassWorkerPath}. Please ensure that sass.js is installed.`,
                        );
                    if (existsSync(destPath)) return;

                    copySync(sassWorkerPath, destPath);

                    console.log(`[sass] Copied sass.worker.js to ${destPath}`);
                },
            });

            return config;
        };
    })(config.vite as ViteConfigBuilder);

    return config;
}
