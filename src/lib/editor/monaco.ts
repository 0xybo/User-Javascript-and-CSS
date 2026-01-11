import z, { ZodObject } from 'zod';

export function zEditorMonacoFactory(zEditorBase: ZodObject) {
    return zEditorBase.extend({
        name: z.literal('monaco').default('monaco'),
    });
}
