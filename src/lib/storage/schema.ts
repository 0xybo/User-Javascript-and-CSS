import z from 'zod';
import { zEditor, zEditorMonaco } from './editor';
import {
    DarkThemePalette,
    LightThemePalette,
    Theme,
    zDarkThemePalette,
    zLightThemePalette,
    zTheme,
} from './theme';
import { FileType, ItemType, SortBy } from './types';

z.config({
    jitless: true, // Disable JIT mode to avoid issues with environments that disallow eval, such as browser extensions with manifest v3.
});

export const zFile = z.object({
    type: z.enum(FileType),
    name: z.string().optional(),
    id: z.string().default(() => crypto.randomUUID()),
    content: z.string().default(''),
    src: z.string().optional(),
});

export const zScript = zFile.extend({
    type: z.literal(FileType.Typescript).default(FileType.Typescript),
    compiled: z.string().default(''),
    isolated: z.boolean().default(false),
    recursive: z.boolean().default(false),
    atStart: z.boolean().default(false),
});

export const zStyle = zFile.extend({
    type: z.literal(FileType.Css).default(FileType.Css),
    compiled: z.string().default(''),
    injected: z.boolean().default(false),
    important: z.boolean().default(false),
});

export const zItem = z.object({
    type: z.enum(ItemType),
    name: z.string().optional(),
    id: z.string().default(() => crypto.randomUUID()),
    sync: z.boolean().default(true),
});

export const zModule = zItem.extend({
    type: z.literal(ItemType.Module).default(ItemType.Module),
    package: z.string().optional(),
    files: z.array(zFile).default(() => []),
});

export const zRule = zItem.extend({
    type: z.literal(ItemType.Rule).default(ItemType.Rule),
    modules: z.array(z.string()).default(() => []),
    created: z.number().default(() => Date.now()),
    updated: z.number().default(() => Date.now()),
    patterns: z.string().default(''),
    style: zStyle.default(() => zStyle.parse({})),
    script: zScript.default(() => zScript.parse({})),
    enabled: z.boolean().default(true),
});

export const zInfo = z.object({
    emitter: z.string().default(''),
    created: z.number().default(() => Date.now()),
    updated: z.number().default(() => Date.now()),
});

export const zSettings = z.object({
    sortBy: z.enum(SortBy).default(SortBy.NameDescending),
    badgeCount: z.boolean().default(true),
    editor: zEditor.default(() => zEditorMonaco.parse({})),
    theme: zTheme.default(Theme.Auto),
    themePalette: z
        .object({
            [Theme.Light]: zLightThemePalette.default(LightThemePalette.Chrome),
            [Theme.Dark]: zDarkThemePalette.default(DarkThemePalette.Monokai),
        })
        .default(() => ({
            [Theme.Light]: LightThemePalette.Chrome,
            [Theme.Dark]: DarkThemePalette.Monokai,
        })),
});

export const zDraft = z.object({
    isNew: z.boolean().default(true),
    // changed: z.boolean().default(false),
    item: z.xor([zRule, zModule]).default(() => zRule.parse({})),
    files: z.record(z.string(), z.string()).default(() => ({})),
});

export const zStorage = z.object({
    info: zInfo.default(() => zInfo.parse({})),
    settings: zSettings.default(() => zSettings.parse({})),
    rules: z.array(zRule).default(() => []),
    modules: z.array(zModule).default(() => []),
    drafts: z.array(zDraft).default(() => []),
});

export const zRemoteSettingsInfo = z.object({
    chunkLength: z.number().default(0),
    updated: z.number().default(0),
});
