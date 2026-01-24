import z from 'zod';
import { zEditorAceFactory } from './ace';
import { zEditorCodemirrorFactory } from './codemirror';
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
    softTabs: z.boolean().default(true),
    invisibleChars: z.boolean().default(false),
});
export type EditorBaseT = z.infer<typeof zEditorBase>;

export const zEditorMonaco = zEditorMonacoFactory<typeof zEditorBase>(zEditorBase);
export type EditorMonacoT = z.infer<typeof zEditorMonaco>;
export const zEditorAce = zEditorAceFactory<typeof zEditorBase>(zEditorBase);
export type EditorAceT = z.infer<typeof zEditorAce>;
export const zEditorCodemirror = zEditorCodemirrorFactory<typeof zEditorBase>(zEditorBase);
export type EditorCodemirrorT = z.infer<typeof zEditorCodemirror>;

export const zEditor = z.xor([zEditorMonaco, zEditorAce, zEditorCodemirror]);
export type EditorT = EditorMonacoT | EditorAceT | EditorCodemirrorT;
