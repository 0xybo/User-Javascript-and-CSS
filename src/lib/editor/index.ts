import z from 'zod';
import { zEditorAceFactory } from './ace';
import { zEditorCodemirrorFactory } from './codeMirror';
import { zEditorMonacoFactory } from './monaco';

export enum Editor {
    Monaco = 'monaco',
    Ace = 'ace',
    Codemirror = 'codemirror',
}

export const zEditorBase = z.object({
    name: z.enum(Editor).default(Editor.Monaco),
    fontSize: z.number().default(14),
    tabSize: z.number().default(4),
    wrap: z.boolean().default(true),
    fontFamily: z.string().default('Fira Code, monospace'),
    ligatures: z.boolean().default(false),
});

export const zEditorMonaco = zEditorMonacoFactory(zEditorBase);
export const zEditorAce = zEditorAceFactory(zEditorBase);
export const zEditorCodemirror = zEditorCodemirrorFactory(zEditorBase);

export const zEditor = z.xor([zEditorMonaco, zEditorAce, zEditorCodemirror]);
export type IEditor = z.infer<typeof zEditor>;
