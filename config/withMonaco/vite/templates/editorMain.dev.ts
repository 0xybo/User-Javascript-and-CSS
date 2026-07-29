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
const cached = new Map();

self['MonacoEnvironment'] = {
    globalAPI: ${globalAPI || false},
    getWorker: ((workers) => (_, label) => {
        if (!workers[label]) {
            console.warn('[monaco] no worker found for label', label);
            return null;
        }

        if (cached.has(label)) return cached.get(label);
        
        const url = browser.runtime.getURL(workers[label]);
        console.log('[monaco] loading worker', label, url);

        const worker = new Worker(url, { type: 'module' });
        cached.set(label, worker);

        return worker;
    })({
        ${workersObject.join(',\n        ')}
    })
};

${featuresImports.join('\n')}
${languagesImports.join('\n')}

export * from './editor.api.js';
`;
