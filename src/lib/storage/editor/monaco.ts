import z, { util } from 'zod';

const SHAPE = {
    name: z.literal('monaco').default('monaco'),
    minimap: z.boolean().default(true),
};
export function zEditorMonacoFactory<TEditorBase extends z.ZodObject>(
    zEditorBase: TEditorBase,
): TEditorBase extends z.ZodObject<infer TShape, infer TConfig>
    ? z.ZodObject<util.Extend<TShape, typeof SHAPE>, TConfig>
    : never {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return zEditorBase.extend(SHAPE) as any;
}
