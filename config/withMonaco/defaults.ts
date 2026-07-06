import { type IFeatureDefinition } from 'monaco-editor/esm/metadata.js';

/**
 * Static entry for the editorWorkerService that always needs to be present.
 */
export const editor_module: IFeatureDefinition = {
    label: 'editorWorkerService',
    entry: undefined,
    worker: {
        id: 'vs/editor/editor',
        entry: 'vs/editor/editor.worker',
    },
};
