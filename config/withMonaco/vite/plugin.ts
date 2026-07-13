import { Plugin } from 'vite';
import { resolveFeatures } from '../resolvers/features';
import { resolveLanguages } from '../resolvers/languages';
import { resolveMonacoPath } from '../resolvers/paths';
import { resolveWorkers } from '../resolvers/workers';
import type { MonacoOptions } from '../types';

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

    return {
        name: 'monaco',
        enforce: 'pre',

        config(config) {
            if (!config.optimizeDeps) {
                config.optimizeDeps = {};
            }
            const optimizeDeps = config.optimizeDeps;

            if (!optimizeDeps.exclude) {
                optimizeDeps.exclude = [];
            }
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
                const workerPaths = workers.map((worker) => {
                    return `"${worker.label}": () => new ${worker.label}()`;
                });
                const workerPathsJson = '{' + workerPaths.join(',') + '}';
                const result = [
                    ...workers.map((worker) => {
                        return `import ${worker.label} from '${resolveMonacoPath(worker.entry)}?worker'`;
                    }),
                    `self['MonacoEnvironment'] = (function (paths) {
                        return {
                            globalAPI: ${options?.globalAPI || false},
                            getWorker: function (moduleId, label) {
                                return paths[label]?.();
                            },
                        };
                    })(${workerPathsJson});`,
                    ...features
                        .flatMap((feature) => feature.entry)
                        .filter(Boolean)
                        .map((entry) => `import "${resolveMonacoPath(entry!)}";`),
                    ...languages
                        .flatMap((lang) => lang.entry)
                        .filter(Boolean)
                        .map((entry) => `import "${resolveMonacoPath(entry!)}";`),
                    "export * from './editor.api.js';",
                ].join('\n');

                return result;
            } else if (id.match(/esm[/\\]vs[/\\]editor[/\\]editor.all.js/)) {
                return 'throw "Please use esm/vs/editor.main.js or monaco-editor directly instead!"';
            } else if (id.match(/esm[/\\]vs[/\\]editor[/\\]edcore.main.js/)) {
                return 'throw "Please use esm/vs/editor.main.js or monaco-editor directly instead!"';
            }
        },
    };
}
