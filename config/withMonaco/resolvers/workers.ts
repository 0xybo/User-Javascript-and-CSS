import { type IFeatureDefinition } from 'monaco-editor/esm/metadata.js';
import { editor_module } from '../defaults';
import type { IWorkerDefinition } from '../types';

/**
 * Resolves all workers, and also makes sure we're having the editorWorkerService.
 *
 * @param languages the resolved languages
 * @param features the resolved features
 * @returns list of all workers
 */
export function resolveWorkers(
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
