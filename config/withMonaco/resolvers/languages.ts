import type { IFeatureDefinition } from 'monaco-editor/esm/metadata.js';
import metadata from 'monaco-editor/esm/metadata.js';
import type { Languages } from '../types';
import { filterNull } from '../utils';

/**
 * Resolves all languages
 *
 * @param languages the languages configuration
 * @returns the resolved feature definitions
 */
export function resolveLanguages(
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
            console.error('[monaco] unknown language:', name);
            return null;
        }
        return lang;
    }

    return filterNull(languages.map(resolveLanguage).concat(customLanguages));
}
