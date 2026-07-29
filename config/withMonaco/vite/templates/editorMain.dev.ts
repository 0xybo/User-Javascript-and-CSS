export const generateMain = ({
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
self['MonacoEnvironment'] = {
    globalAPI: ${globalAPI || false},
    getWorker: ((workers) => (_, label) => {
        if (!workers[label]) {
            console.warn('[monaco] no worker found for label', label);
            return null;
        }
        
        const url = browser.runtime.getURL(workers[label]);
        console.log('[monaco] loading worker', label, url);
        return new Worker(url, { type: 'module' });
    })({
        ${workersObject.join(',\n        ')}
    })
};

${featuresImports.join('\n')}
${languagesImports.join('\n')}

export * from './editor.api.js';
`;
