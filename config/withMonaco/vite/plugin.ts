import fs from 'fs-extra';
import { resolve } from 'path';
import type { PluginContext } from 'rollup';
import { Plugin } from 'vite';
import { resolveFeatures } from '../resolvers/features';
import { resolveLanguages } from '../resolvers/languages';
import { resolveMonacoPath } from '../resolvers/paths';
import { resolveWorkers } from '../resolvers/workers';
import type { MonacoOptions } from '../types';

const generateMain = ({
    workersImports,
    workersObject,
    featuresImports,
    languagesImports,
    globalAPI,
}: {
    workersImports: string[];
    workersObject: string[];
    featuresImports: string[];
    languagesImports: string[];
    globalAPI: boolean;
}) => `
${workersImports.join('\n')}

self['MonacoEnvironment'] = {
    globalAPI: ${globalAPI || false},
    getWorker: ((workers) => (_, label) => workers[label]())({
        ${workersObject.join(',\n        ')}
    })
};

${featuresImports.join('\n')}
${languagesImports.join('\n')}

export * from './editor.api.js';
`;

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
    const isProduction = process.env.NODE_ENV === 'production';

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
            if (id.match(/esm[/\\]vs[/\\]editor[/\\]editor.main.js/)) {
                return generateMain({
                    workersImports: workers.map(
                        (worker) =>
                            `import ${worker.label} from '${resolveMonacoPath(worker.entry)}?worker&url';`,
                    ),
                    workersObject: workers.map(
                        (worker) => `'${worker.label}': () => new ${worker.label}()`,
                    ),
                    featuresImports: features
                        .flatMap((feature) => feature.entry)
                        .filter(Boolean)
                        .map((entry) => `import "${resolveMonacoPath(entry!)}";`),
                    languagesImports: languages
                        .flatMap((lang) => lang.entry)
                        .filter(Boolean)
                        .map((entry) => `import "${resolveMonacoPath(entry!)}";`),
                    globalAPI: options?.globalAPI || false,
                });
            } else if (id.match(/esm[/\\]vs[/\\]editor[/\\]editor.all.js/)) {
                return 'throw "Please use esm/vs/editor.main.js or monaco-editor directly instead!"';
            } else if (id.match(/esm[/\\]vs[/\\]editor[/\\]edcore.main.js/)) {
                return 'throw "Please use esm/vs/editor.main.js or monaco-editor directly instead!"';
            }
        },

        buildEnd() {
            if (isProduction) return;
            // Only target html entrypoints (options and popup)
            if (!isHtmlEntrypoint(this)) return;

            // DEV ONLY: Copy the monaco-editor (monaco-editor/esm) folder to the dist folder for development purposes
            const monacoPath = resolve(process.cwd(), 'node_modules', 'monaco-editor', 'esm');
            const distPath = resolve(process.cwd(), 'dist', 'monaco-editor');

            fs.copySync(monacoPath, distPath, { overwrite: true });

            console.log(`[monaco] Copied monaco-editor to ${distPath}`);
        },
    };
}
