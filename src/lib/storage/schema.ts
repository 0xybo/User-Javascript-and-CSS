import { defaultLocale, locales } from '@/locales';
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
    // Disable JIT mode to avoid issues with environments that disallow eval, such as browser
    // extensions with manifest v3.
    jitless: true,
});

/**
 * Zod schema of a file object, representing the structure and validation rules for files stored
 * in the extension's storage. It includes properties for the file type, name, unique identifier,
 * content, and source URL, with default values and optional fields as appropriate.
 */
export const zFile = z.object({
    /** The type of the file. */
    type: z.enum(FileType),
    /** The name of the file. */
    name: z.string().optional(),
    /** The unique identifier of the file, generated using a UUID. */
    id: z.string().default(() => crypto.randomUUID()),
    /** The content of the file. Defaults to an empty string. */
    content: z.string().default(''),
    /** The source URL of the file, if applicable. */
    src: z.string().optional(),
});

/**
 * Zod schema of a script file object, extending the base file schema with additional properties
 * specific to script files.
 */
export const zScript = zFile.extend({
    /** The type of the script file. Defaults to {@link FileType.Typescript}. */
    type: z.literal(FileType.Typescript).default(FileType.Typescript),
    /** The compiled content of the script file. Defaults to an empty string. */
    compiled: z.string().default(''),
    /** Indicates whether the script file has to run in an isolated context. Defaults to false. */
    isolated: z.boolean().default(false),
    /** Indicates whether the script file should run recursively. Defaults to false. */
    recursive: z.boolean().default(false),
    /** Indicates whether the script file should run at the start of the page load.
     * Defaults to false. */
    atStart: z.boolean().default(false),
});

/**
 * Zod schema of a style file object, extending the base file schema with additional properties
 * specific to style files.
 */
export const zStyle = zFile.extend({
    /** The type of the style file. Defaults to {@link FileType.Css}. */
    type: z.literal(FileType.Css).default(FileType.Css),
    /** The compiled content of the style file. Defaults to an empty string. */
    compiled: z.string().default(''),
    /** Indicates whether the style file should be injected into the page. Defaults to false. */
    injected: z.boolean().default(false),
    /** Indicates whether the style file is important. Defaults to false. */
    important: z.boolean().default(false),
});

/**
 * Zod schema of a item object, representing the structure and validation rules for items stored
 * in the extension's storage. It includes properties for the item type, name, unique identifier,
 * and synchronization status, with default values and optional fields as appropriate.
 */
export const zItem = z.object({
    /** The type of the item. */
    type: z.enum(ItemType),
    /** The name of the item. */
    name: z.string().optional(),
    /** The unique identifier of the item, generated using a UUID. */
    id: z.string().default(() => crypto.randomUUID()),
    /** Indicates whether the item should be synchronized across devices. Defaults to true. */
    sync: z.boolean().default(true),
});

/**
 * Zod schema of a module object, extending the base item schema with additional properties
 * specific to modules. It includes properties for the package name and an array of associated
 * files, with default values and optional fields as appropriate.
 */
export const zModule = zItem.extend({
    /** The type of the module item. Defaults to {@link ItemType.Module}. */
    type: z.literal(ItemType.Module).default(ItemType.Module),
    /** The package name of the module. Optional field. */
    package: z.string().optional(),
    /** An array of associated file objects for the module. Defaults to an empty array. */
    files: z.array(zFile).default(() => []),
});

/**
 * Zod schema of a rule object, extending the base item schema with additional properties
 * specific to rules. It includes properties for associated modules, timestamps for creation and
 * updates, patterns, style and script objects, and an enabled flag, with default values and
 * optional fields as appropriate.
 */
export const zRule = zItem.extend({
    /** The type of the rule item. Defaults to {@link ItemType.Rule}. */
    type: z.literal(ItemType.Rule).default(ItemType.Rule),
    /** An array of associated module identifiers. Defaults to an empty array. */
    modules: z.array(z.string()).default(() => []),
    /** The timestamp when the rule was created. Defaults to the current timestamp. */
    created: z.number().default(() => Date.now()),
    /** The timestamp when the rule was last updated. Defaults to the current timestamp. */
    updated: z.number().default(() => Date.now()),
    /** The patterns for the rule. Defaults to an empty string. */
    patterns: z.string().default(''),
    /** The style associated with the rule. Defaults to a default style object. */
    style: zStyle.default(() => zStyle.parse({})),
    /** The script associated with the rule. Defaults to a default script object. */
    script: zScript.default(() => zScript.parse({})),
    /** Indicates whether the rule is enabled. Defaults to true. */
    enabled: z.boolean().default(true),
});

/**
 * Zod schema of an info object, representing metadata about the extension's storage. It includes
 * properties for the emitter, creation timestamp, and update timestamp, with default values as
 * appropriate.
 */
export const zInfo = z.object({
    /** The emitter of the info object. Defaults to an empty string. */
    emitter: z.string().default(''),
    /** The timestamp when the info object was created. Defaults to the current timestamp. */
    created: z.number().default(() => Date.now()),
    /** The timestamp when the info object was last updated. Defaults to the current timestamp. */
    updated: z.number().default(() => Date.now()),
});

/**
 * Zod schema of a settings object, representing the configuration settings for the extension.
 * It includes properties for sorting, badge count, editor configuration, theme selection,
 * language preference, synchronization status, and developer mode settings, with default values
 * and optional fields as appropriate.
 */
export const zSettings = z.object({
    /** The sorting preference for the extension's items. Defaults to
     * {@link SortBy.NameDescending}. */
    sortBy: z.enum(SortBy).default(SortBy.NameDescending),
    /** Indicates whether the badge count is enabled. Defaults to true. */
    badgeCount: z.boolean().default(true),
    /** The editor configuration for the extension. Defaults to a default editor object
     * {@link zEditorMonaco}. */
    editor: zEditor.default(() => zEditorMonaco.parse({})),
    /** The theme selection for the extension. Defaults to {@link Theme.Auto}. */
    theme: zTheme.default(Theme.Auto),
    /** The theme palette selection for the extension, with separate defaults for light and dark
     * themes. */
    themePalette: z
        .object({
            /** The theme palette for the light theme. Defaults to
             * {@link LightThemePalette.Chrome}. */
            [Theme.Light]: zLightThemePalette.default(LightThemePalette.Chrome),
            /** The theme palette for the dark theme. Defaults to
             * {@link DarkThemePalette.Monokai}. */
            [Theme.Dark]: zDarkThemePalette.default(DarkThemePalette.Monokai),
        })
        .default(() => ({
            /** The default theme palette for the light theme. */
            [Theme.Light]: LightThemePalette.Chrome,
            /** The default theme palette for the dark theme. */
            [Theme.Dark]: DarkThemePalette.Monokai,
        })),
    /** The language preference for the extension. Defaults to 'en-US' (English). */
    language: z.enum(Object.keys(locales) as [string, ...string[]]).default(defaultLocale),
    /** Indicates whether synchronization is enabled for the extension. Defaults to true. */
    syncEnabled: z.boolean().default(true),
    /** Indicates whether developer mode is enabled for the extension. Defaults to false. */
    autoEnableDevMode: z.boolean().default(false),
});

/**
 * Zod schema of a draft object, representing a draft item in the extension's storage. It includes
 * properties for the draft's new status, the associated item (either a rule or a module), and
 * any associated files, with default values and optional fields as appropriate.
 */
export const zDraft = z.object({
    /** Indicates whether the draft is new. Defaults to true. */
    isNew: z.boolean().default(true),
    /** Indicates whether the draft has been changed. Defaults to false. */
    changed: z.boolean().default(false),
    /** The associated item for the draft, which can be either a rule or a module. Defaults to a
     * default rule object {@link zRule}. */
    item: z.xor([zRule, zModule]).default(() => zRule.parse({})),
    /** An object containing associated files for the draft, with file identifiers as keys and file
     * names as values. Defaults to an empty object. */
    files: z.record(z.string(), z.string()).default(() => ({})),
});

/**
 * Zod schema of the entire storage object, representing the structure and validation rules for
 * the extension's storage. It includes properties for metadata, settings, rules, modules, and
 * drafts, with default values and optional fields as appropriate.
 */
export const zStorage = z.object({
    /** The metadata information for the storage. Defaults to a default info object
     * {@link zInfo}. */
    info: zInfo.default(() => zInfo.parse({})),
    /** The configuration settings for the extension. Defaults to a default settings object
     * {@link zSettings}. */
    settings: zSettings.default(() => zSettings.parse({})),
    /** An array of rule objects stored in the extension's storage. Defaults to an empty array.
     * For more information, see {@link zRule}. */
    rules: z.array(zRule).default(() => []),
    /** An array of module objects stored in the extension's storage. Defaults to an empty array.
     * For more information, see {@link zModule}. */
    modules: z.array(zModule).default(() => []),
    /** An array of draft objects stored in the extension's storage. Defaults to an empty array.
     * For more information, see {@link zDraft}. */
    drafts: z.array(zDraft).default(() => []),
});

/**
 * Zod schema for remote settings information.
 */
export const zRemoteSettingsInfo = z.object({
    /** The length of each chunk of data. Defaults to 0. */
    chunkLength: z.number().default(0),
    /** The timestamp of the last update. Defaults to 0. */
    updated: z.number().default(0),
});

/**
 * On-disk format for rules (content stored separately in f:<UUID> keys).
 */
export const zRuleStored = zRule.omit({ script: true, style: true }).extend({
    /** The unique identifier of the associated script file. */
    scriptId: z.string(),
    /** The unique identifier of the associated style file. */
    styleId: z.string(),
});

/**
 * On-disk format for modules (files stored separately in f:<UUID> keys).
 */
export const zModuleStored = zModule.omit({ files: true }).extend({
    /** An array of unique identifiers for the associated files of the module. */
    fileIds: z.array(z.string()),
});

/**
 * On-disk format for drafts (files stored separately in d:<UUID> keys).
 */
export const zDraftStored = z.object({
    /** Indicates whether the draft is new. */
    isNew: z.boolean(),
    /** The unique identifier of the associated item (rule or module). */
    itemId: z.string(),
    /** The type of the associated item (rule or module). */
    itemType: z.enum(ItemType),
    /** An array of unique identifiers for the associated files of the draft. */
    fileIds: z.array(z.string()),
});
