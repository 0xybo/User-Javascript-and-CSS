import fs from 'fs-extra';
import { resolve } from 'path';
import type { PluginContext } from 'rollup';
import { Plugin } from 'vite';
import { resolveFeatures } from '../resolvers/features';
import { resolveLanguages } from '../resolvers/languages';
import { resolveMonacoPath } from '../resolvers/paths';
import { resolveWorkers } from '../resolvers/workers';
import type { MonacoOptions } from '../types';

import { filterNull, unique } from '../utils';
import { generateMain as generateMainDev } from './templates/editorMain.dev';
import { generateMain as generateMainProd } from './templates/editorMain.prod';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const generateMain = IS_PRODUCTION ? generateMainProd : generateMainDev;

/**
 * Plugin to control monaco-editor bundeling
 *
 * @param options options for the plugin
 * @returns a new plugin instance
 */
export function monaco(options?: MonacoOptions): Plugin {
    const languages = resolveLanguages(options?.languages || [], options?.customLanguages || []);
    const features = resolveFeatures(options?.features);
    const workers = resolveWorkers(languages, features);

    const isHtmlEntrypoint = (ctx: PluginContext) => {
        return ctx.environment.config.define?.['import.meta.env.ENTRYPOINT'] === '"html"';
    };

    return {
        name: 'vite-plugin-monaco-editor',
        enforce: 'pre',

        config(config) {
            if (!config.optimizeDeps) config.optimizeDeps = {};
            const optimizeDeps = config.optimizeDeps;

            if (!optimizeDeps.exclude) optimizeDeps.exclude = [];
            optimizeDeps.exclude.push('monaco-editor');

            if (optimizeDeps.include?.includes('monaco-editor')) {
                console.log(
                    "[monaco] removed 'monaco-editor' from the optimizeDeps.include setting.",
                );
                optimizeDeps.include = optimizeDeps.include.filter((i) => i === 'monaco-editor');
            }
        },

        load(id) {
            const outputDir = this.environment.config.build?.outDir || 'dist';

            if (id.match(/esm[/\\]vs[/\\]editor[/\\]editor.main.js/)) {
                const result = generateMain({
                    workersImports: workers.map(
                        (worker) =>
                            `import ${worker.label} from '${resolveMonacoPath(worker.entry, outputDir)}?worker';`,
                    ),
                    workersObject: IS_PRODUCTION
                        ? workers.map((worker) => `'${worker.label}': () => new ${worker.label}()`)
                        : workers.map(
                              (worker) => `'${worker.label}': '/monaco-editor/${worker.entry}.js'`,
                          ),
                    featuresImports: filterNull(
                        unique(features.flatMap((feature) => feature.entry)),
                    ).map((entry) => `import "${resolveMonacoPath(entry!, outputDir)}";`),
                    languagesImports: filterNull(
                        unique(languages.flatMap((lang) => lang.entry)),
                    ).map((entry) => `import "${resolveMonacoPath(entry!, outputDir)}";`),
                    globalAPI: options?.globalAPI || false,
                });

                console.log('[monaco] generated editor.main.js');
                return result;
            } else if (id.match(/esm[/\\]vs[/\\]editor[/\\]editor.all.js/)) {
                return 'throw "Please use esm/vs/editor.main.js or monaco-editor directly instead!"';
            } else if (id.match(/esm[/\\]vs[/\\]editor[/\\]edcore.main.js/)) {
                return 'throw "Please use esm/vs/editor.main.js or monaco-editor directly instead!"';
            }
        },

        buildEnd() {
            if (IS_PRODUCTION) return;
            // Only target html entrypoints (options and popup)
            if (!isHtmlEntrypoint(this)) return;

            const outputDir = this.environment.config.build?.outDir || 'dist';

            // DEV ONLY: Copy the monaco-editor (monaco-editor/esm) folder to the dist folder for development purposes
            const monacoPath = resolve(process.cwd(), 'node_modules', 'monaco-editor', 'esm');
            const distPath = resolve(process.cwd(), outputDir, 'monaco-editor');

            fs.copySync(monacoPath, distPath, { overwrite: true });

            console.log(`[monaco] Copied monaco-editor to ${distPath}`);
        },
    };
}
