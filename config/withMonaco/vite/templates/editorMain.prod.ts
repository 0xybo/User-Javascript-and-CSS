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
${workersImports.join('\n')}

self['MonacoEnvironment'] = {
    globalAPI: ${globalAPI || false},
    getWorker: ((workers) => (_, label) => workers[label]())({
        ${workersObject.join(',\n        ')}
    })
};

${featuresImports.join('\n')}
${languagesImports.join('\n')}

export * from './editor.api.js';
`;
