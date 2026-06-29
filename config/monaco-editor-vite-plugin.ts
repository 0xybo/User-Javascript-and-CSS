import metadata, {
    EditorFeature,
    EditorLanguage,
    IFeatureDefinition,
    NegatedEditorFeature,
} from 'monaco-editor/esm/metadata.js';
import path from 'node:path';
import { Plugin } from 'vite';

/**
 * Configuration value of available monaco languages
 */
type Languages = '*' | 'all' | EditorLanguage[];

/**
 * Configuration value of available monaco features
 */
type Features = '*' | 'all' | ('codicons' | EditorFeature | NegatedEditorFeature)[];

/**
 * Options for the plugin
 */
export interface MonacoOptions {
    /**
     * Configures the available monaco features
     */
    features?: Features;

    /**
     * Configures the available monaco standard languages
     */
    languages?: Languages;

    /**
     * Configures custom languages
     */
    customLanguages?: IFeatureDefinition[];

    /**
     * If this is set to `true`, the a global `monaco` object is published in the browser.
     */
    globalAPI?: boolean;
}

/**
 * Little helper to ensure that a list of elements only contains truthy values
 *
 * @param list the list to filter
 * @returns the filtered list
 */
function filterNull<T>(list: (T | null)[]): T[] {
    return list.filter(Boolean) as T[];
}

/**
 * Resolves all languages
 *
 * @param languages the languages configuration
 * @returns the resolved feature definitions
 */
function resolveLanguages(
    languages: Languages,
    customLanguages: IFeatureDefinition[],
): IFeatureDefinition[] {
    if (languages === '*' || languages === 'all') {
        return filterNull(metadata.languages.concat(customLanguages));
    }

    if (languages.length <= 0) {
        return filterNull(customLanguages);
    }

    const langById: { [name: string]: IFeatureDefinition } = {};
    metadata.languages.forEach((l) => (langById[l.label] = l));

    function resolveLanguage(name: string) {
        const lang = langById[name];
        if (!lang) {
            console.error('[bithero-monaco] unknown language:', name);
            return null;
        }
        return lang;
    }

    return filterNull(languages.map(resolveLanguage).concat(customLanguages));
}

/**
 * Resolves all features
 *
 * @param features the features configuration
 * @returns the resolved feature definitions
 */
function resolveFeatures(features?: Features): IFeatureDefinition[] {
    if (!features) {
        return metadata.features;
    }

    if (features === '*' || features === 'all') {
        return metadata.features;
    }

    const featureById: { [name: string]: IFeatureDefinition } = {};
    metadata.features.forEach((f) => {
        if (featureById[f.label]) {
            const def = featureById[f.label];
            if (typeof def.entry === 'string') {
                def.entry = [def.entry];
            }
            def.entry?.push(...(f.entry || []));
        } else {
            featureById[f.label] = f;
        }
    });

    // Monaco versions before 55.0 did store codicons differently...
    // const codicons_path = resolveMonacoPath('vs/base/browser/ui/codicons/codiconStyles.js');
    // if (fs.existsSync(codicons_path)) {
    //     featureById['codicons'] = {
    //         label: 'codicons',
    //         entry: 'vs/base/browser/ui/codicons/codiconStyles.js',
    //     };
    // }

    function resolveFeature(name: string) {
        const feature = featureById[name];
        if (!feature) {
            if (name == 'codicons' && featureById['codicon']) return featureById['codicon'];
            if (name == 'codicon' && featureById['codicons']) return featureById['codicons'];

            console.error('[bithero-monaco] unknown feature:', name);
            return null;
        }
        return feature;
    }

    const excluded = features.filter((f) => f[0] === '!').map((f) => f.slice(1));
    if (excluded.length > 0) {
        return filterNull(
            Object.keys(featureById)
                .filter((f) => !excluded.includes(f))
                .map(resolveFeature),
        );
    }
    return filterNull(features.map(resolveFeature));
}

/**
 * Static entry for the editorWorkerService that always needs to be present.
 */
const editor_module: IFeatureDefinition = {
    label: 'editorWorkerService',
    entry: undefined,
    worker: {
        id: 'vs/editor/editor',
        entry: 'vs/editor/editor.worker',
    },
};

/**
 * @internal worker definition
 */
interface IWorkerDefinition {
    label: string;
    id: string;
    entry: string;
}

/**
 * Resolves all workers, and also makes sure we're having the editorWorkerService.
 *
 * @param languages the resolved languages
 * @param features the resolved features
 * @returns list of all workers
 */
function resolveWorkers(
    languages: IFeatureDefinition[],
    features: IFeatureDefinition[],
): IWorkerDefinition[] {
    const modules = [editor_module].concat(languages).concat(features);
    const workers: IWorkerDefinition[] = [];
    modules.forEach((mod) => {
        if (mod.worker) {
            workers.push({
                label: mod.label,
                id: mod.worker.id,
                entry: mod.worker.entry,
            });
        }
    });
    return workers;
}

/**
 * Resolves an module path by utilising `import.meta.resolve`, but making sure we're returning
 * the string path instead of an URL'ish thing.
 *
 * @param file the filepath to resolve
 * @return the resolved path
 */
function resolveModule(file: string): string {
    const url = import.meta.resolve(file).toString();
    return decodeURI(url.replace(/^file:\/\//, ''));
}

/**
 * Resolves an file path either against the monaco-editor esm package, or by itself.
 *
 * @param file the filepath to resolve
 * @returns the resolved path
 */
function resolveMonacoPath(file: string): string {
    try {
        return resolveModule(path.join('monaco-editor/esm', file));
    } catch {
        /* empty */
    }

    try {
        return resolveModule(path.join(process.cwd(), 'node_modules/monaco-editor/esm', file));
    } catch {
        /* empty */
    }

    return resolveModule(file);
}

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

            if (optimizeDeps.include) {
                console.log(
                    "[bithero-monaco] removed 'monaco-editor' from the optimizeDeps.include setting.",
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
