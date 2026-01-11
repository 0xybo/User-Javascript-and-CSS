import z, { ZodObject } from 'zod';

export function zEditorCodemirrorFactory(zEditorBase: ZodObject) {
    return zEditorBase.extend({
        name: z.literal('codemirror').default('codemirror'),
    });
}
