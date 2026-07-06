import metadata, { type IFeatureDefinition } from 'monaco-editor/esm/metadata.js';
import type { Features } from '../types';
import { filterNull } from '../utils';

/**
 * Resolves all features
 *
 * @param features the features configuration
 * @returns the resolved feature definitions
 */
export function resolveFeatures(features?: Features): IFeatureDefinition[] {
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

    function resolveFeature(name: string) {
        const feature = featureById[name];
        if (!feature) {
            if (name == 'codicons' && featureById['codicon']) return featureById['codicon'];
            if (name == 'codicon' && featureById['codicons']) return featureById['codicons'];

            console.error('[monaco] unknown feature:', name);
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
