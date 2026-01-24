import z, { util, ZodObject } from 'zod';

export enum AceKeyboard {
    VSCode = 'vscode',
    Sublime = 'sublime',
    Vim = 'vim',
    Default = 'default',
}

const SHAPE = {
    name: z.literal('ace').default('ace'),
    keyboard: z.enum(AceKeyboard).default(AceKeyboard.Default),
};

export function zEditorAceFactory<TEditorBase extends ZodObject>(
    zEditorBase: TEditorBase,
): TEditorBase extends ZodObject<infer TShape, infer TConfig>
    ? ZodObject<util.Extend<TShape, typeof SHAPE>, TConfig>
    : never {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return zEditorBase.extend(SHAPE) as any;
}
