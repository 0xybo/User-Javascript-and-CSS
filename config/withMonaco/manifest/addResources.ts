import type { ManifestBuilder } from '../types';

export function addResources(builder: ManifestBuilder): ManifestBuilder {
    return (manifest) => {
        manifest = builder(manifest);

        manifest.web_accessible_resources = [
            {
                resources: ['monaco/*.js'],
                matches: ['<all_urls>'],
            },
        ];

        return manifest;
    };
}
