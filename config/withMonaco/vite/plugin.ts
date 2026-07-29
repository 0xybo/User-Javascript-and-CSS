import fs from 'fs-extra';
import type { EditorLanguage } from 'monaco-editor/esm/metadata.js';
import { resolve } from 'path';
import { Plugin } from 'vite';
import { resolveFeatures } from '../resolvers/features';
import { resolveLanguages } from '../resolvers/languages';
import { resolveMonacoPath } from '../resolvers/paths';
import { resolveWorkers } from '../resolvers/workers';
import type { IWorkerDefinition, MonacoOptions } from '../types';
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
    const workersFullList = languages.reduce(
        (acc, language) => {
            if (language.worker) return acc;
            const fallbackLabel = options?.workerFallback?.[language.label as EditorLanguage];
            if (!fallbackLabel) return acc;

            const fallback = workers.find((w) => w.label === fallbackLabel);

            return [
                ...acc,
                {
                    ...fallback,
                    label: language.label,
                } as IWorkerDefinition,
            ];
        },
        [...workers],
    );

    let cache: string | null = null;

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
                if (cache) return cache;

                const result = generateMain({
                    workersImports: workers.map(
                        (worker) =>
                            `import ${worker.label} from '${resolveMonacoPath(worker.entry, outputDir)}?worker';`,
                    ),
                    workersObject: IS_PRODUCTION
                        ? workersFullList.map(
                              (worker) => `'${worker.label}': () => new ${worker.label}()`,
                          )
                        : workersFullList.map(
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

                return (cache = result);
            } else if (id.match(/esm[/\\]vs[/\\]editor[/\\]editor.all.js/)) {
                return 'throw "Please use esm/vs/editor.main.js or monaco-editor directly instead!"';
            } else if (id.match(/esm[/\\]vs[/\\]editor[/\\]edcore.main.js/)) {
                return 'throw "Please use esm/vs/editor.main.js or monaco-editor directly instead!"';
            }
        },

        buildStart() {
            if (IS_PRODUCTION) return;

            const outputDir = this.environment.config.build?.outDir || 'dist';

            // DEV ONLY: Copy the monaco-editor (monaco-editor/esm) folder to the dist folder for development purposes
            const monacoPath = resolve(process.cwd(), 'node_modules', 'monaco-editor', 'esm');
            const distPath = resolve(process.cwd(), outputDir, 'monaco-editor');

            if (!fs.existsSync(monacoPath))
                throw new Error(
                    `[monaco] monaco-editor not found at ${monacoPath}. Please install it first.`,
                );
            if (fs.existsSync(distPath)) return;

            fs.copySync(monacoPath, distPath);

            console.log(`[monaco] Copied monaco-editor to ${distPath}`);
        },
    };
}
