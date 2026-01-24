import z, { util, ZodObject } from 'zod';

const SHAPE = {
    name: z.literal('codemirror').default('codemirror'),
};

export function zEditorCodemirrorFactory<TEditorBase extends ZodObject>(
    zEditorBase: TEditorBase,
): TEditorBase extends ZodObject<infer TShape, infer TConfig>
    ? ZodObject<util.Extend<TShape, typeof SHAPE>, TConfig>
    : never {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return zEditorBase.extend(SHAPE) as any;
}
