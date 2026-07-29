import type {
    EditorFeature,
    EditorLanguage,
    IFeatureDefinition,
    NegatedEditorFeature,
} from 'monaco-editor/esm/metadata.js';
import type { ConfigEnv, WxtViteConfig } from 'wxt';

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
     * Configures the fallback languages for workers. For example, if a worker for a language is not available, it can fallback to another language's worker.
     */
    workerFallback?: Record<EditorLanguage, EditorLanguage>;

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
 * @internal vite config builder type
 */
export type ViteConfigBuilder = (config: ConfigEnv) => WxtViteConfig;

/**
 * @internal manifest builder type
 */
export type ManifestBuilder = (manifest: UserManifest) => UserManifest;

/**
 * @internal worker definition
 */
export interface IWorkerDefinition {
    label: string;
    id: string;
    entry: string;
}
