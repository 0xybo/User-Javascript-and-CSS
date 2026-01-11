import z, { ZodObject } from 'zod';
import { zEditorBase } from '.';

export function zEditorAceFactory(zEditorBase: ZodObject) {
    return zEditorBase.extend({
        name: z.literal('ace').default('ace'),
        keyboard: z.enum(['vscode', 'sublime', 'vim', 'default']).default('default'),
        invisibleChars: z.boolean().default(false),
        softTabs: z.boolean().default(true),
    });
}
