import { PlainObject } from '@/types/json';
import { Theme } from './theme';
import { FileType, IModule, IRule, IStorage, ItemType, SortBy } from './types';
import { DEFAULTS } from './utils';

/**
 * Shape of the old v3.1.2 extension rule record (`rules` array element). Content is stored
 * separately under a `r:<hash>` storage key.
 */
interface LegacyRule {
    id: string;
    name?: string;
    urls?: string;
    libs?: string[];
    updated?: number;
    created?: number;
    flags?: string[];
}

/**
 * Shape of the old v3.1.2 extension rule content, stored under the `r:<hash>` key.
 */
interface LegacyRuleContent {
    css?: string;
    cssError?: string;
    js?: string;
    jsDraft?: string;
    scss?: string;
    scssDraft?: string;
    styleImportant?: boolean;
}

/**
 * Shape of the old v3.1.2 extension library record (`libs` array element). Content is stored
 * separately under a `m:<hash>` storage key.
 */
interface LegacyLib {
    id: string;
    name?: string;
    src?: string;
    type?: 'js' | 'css';
}

/**
 * Shape of the old v3.1.2 extension module content, stored under the `m:<hash>` key.
 */
interface LegacyModuleContent {
    js?: string;
    css?: string;
    updated?: number;
    error?: string;
}

/**
 * Shape of the old v3.1.2 extension info record.
 */
interface LegacyInfo {
    version?: number;
    updatedAt?: number;
}

/**
 * Checks whether the given raw storage object comes from the original v3.1.2 extension. The old
 * format keeps library records in a top-level `libs` array and rules whose ids start with `r:` —
 * both are absent in the rebuilt extension's layout.
 *
 * @param raw The raw storage object to inspect.
 * @returns True if the object looks like a legacy v3.1.2 storage.
 */
export function detectLegacyStorage(raw: PlainObject): boolean {
    if (!raw || typeof raw !== 'object') return false;
    if ('f:' in raw || 'modules' in raw || 'drafts' in raw) return false;
    if (Array.isArray(raw.libs)) return true;
    const rules = raw.rules;
    return (
        Array.isArray(rules) &&
        rules.some((rule) => typeof rule === 'object' && rule && String((rule as LegacyRule).id).startsWith('r:'))
    );
}

/**
 * Strips the `r:`/`m:` prefix that the old extension prepended to item ids.
 *
 * @param oldId The old prefixed id.
 * @returns The bare id.
 */
function stripPrefix(oldId: string): string {
    const next = oldId.split(':').pop();
    return next && next.length ? next : crypto.randomUUID();
}

/**
 * Maps the old v3.1.2 storage into the rebuilt extension's in-memory storage structure. Rule and
 * module contents are inlined into the returned items; saving them through the storage service
 * will extract them into the `f:<id>` keys as usual.
 *
 * @param raw The raw legacy storage object.
 * @returns A fully structured storage object.
 */
export function migrateLegacyStorage(raw: PlainObject): IStorage {
    const now = Date.now();
    const info = DEFAULTS.INFO();
    const settings = DEFAULTS.SETTINGS();

    // Settings
    const oldSettings = (raw.settings || {}) as {
        badgeCounter?: boolean;
        themeDark?: boolean;
        rulesSortBy?: string;
        rulesSortDesc?: boolean;
        editorFontFamily?: string;
        editorLigatures?: boolean;
        editor?: { tabSize?: number; fontSize?: number; wrap?: boolean | string; useSoftTabs?: boolean; showInvisibles?: boolean };
    };
    settings.badgeCount = oldSettings.badgeCounter ?? settings.badgeCount;
    settings.editor.tabSize = oldSettings.editor?.tabSize ?? settings.editor.tabSize;
    settings.editor.fontSize = oldSettings.editor?.fontSize ?? settings.editor.fontSize;
    settings.editor.wrap = Boolean(oldSettings.editor?.wrap);
    settings.editor.softTabs = oldSettings.editor?.useSoftTabs ?? settings.editor.softTabs;
    settings.editor.invisibleChars = oldSettings.editor?.showInvisibles ?? settings.editor.invisibleChars;
    settings.editor.fontFamily = oldSettings.editorFontFamily ?? settings.editor.fontFamily;
    settings.editor.ligatures = oldSettings.editorLigatures ?? settings.editor.ligatures;
    if (oldSettings.rulesSortBy === 'name') {
        settings.sortBy = oldSettings.rulesSortDesc ? SortBy.NameDescending : SortBy.NameAscending;
    } else if (oldSettings.rulesSortBy === 'created') {
        settings.sortBy = SortBy.Created;
    } else if (oldSettings.rulesSortBy === 'updated') {
        settings.sortBy = SortBy.Updated;
    }

    // Info
    const oldInfo = (raw.info || {}) as LegacyInfo;
    info.emitter = crypto.randomUUID();
    info.created = oldInfo.updatedAt ?? now;
    info.updated = oldInfo.updatedAt ?? now;
    info.theme = oldSettings.themeDark ? Theme.Dark : Theme.Light;

    // Modules (old "libs")
    const modules: IModule[] = ((raw.libs || []) as LegacyLib[]).map((lib) => {
        const oldContent = (raw[lib.id] || {}) as LegacyModuleContent;
        const isCss = lib.type === 'css';
        const fileType = isCss ? FileType.Css : FileType.Javascript;
        return {
            id: stripPrefix(lib.id),
            name: lib.name || '',
            sync: true,
            type: ItemType.Module,
            files: [
                {
                    id: crypto.randomUUID(),
                    type: fileType,
                    content: isCss ? oldContent.css || '' : oldContent.js || '',
                    src: lib.src,
                },
            ],
        };
    });

    // Rules
    const rules: IRule[] = ((raw.rules || []) as LegacyRule[]).map((oldRule) => {
        const oldContent = (raw[oldRule.id] || {}) as LegacyRuleContent;
        const flags = oldRule.flags || [];
        const js = oldContent.js || '';
        const scss = oldContent.scss || '';
        const css = oldContent.css || '';

        return {
            id: stripPrefix(oldRule.id),
            name: oldRule.name || '',
            sync: !flags.includes('dontSync'),
            type: ItemType.Rule,
            modules: (oldRule.libs || []).map(stripPrefix),
            created: oldRule.created || now,
            updated: oldRule.updated || now,
            patterns: oldRule.urls || '',
            script: {
                id: crypto.randomUUID(),
                type: FileType.Typescript,
                content: js,
                compiled: js,
                isolated: flags.includes('isoJS'),
                recursive: flags.includes('deepJS'),
                atStart: flags.includes('atStartJS'),
            },
            style: {
                id: crypto.randomUUID(),
                type: FileType.Css,
                content: scss || css,
                compiled: css,
                injected: false,
                important: Boolean(oldContent.styleImportant),
            },
            enabled: !flags.includes('off'),
            autoFixPatterns: true,
        };
    });

    // Drafts: rules flagged as having unsaved work keep their draft content
    const drafts = ((raw.rules || []) as LegacyRule[]).flatMap((oldRule) => {
        const oldContent = (raw[oldRule.id] || {}) as LegacyRuleContent;
        const flags = oldRule.flags || [];
        if (!flags.includes('draft')) return [];
        const rule = rules.find((r) => r.id === stripPrefix(oldRule.id));
        if (!rule) return [];
        const scriptDraft = oldContent.jsDraft ?? oldContent.js ?? '';
        const styleDraft = oldContent.scssDraft ?? oldContent.scss ?? '';
        if (scriptDraft === rule.script.content && styleDraft === rule.style.content) return [];
        return [
            {
                isNew: false,
                changed: true,
                item: rule,
                files: { [rule.script.id]: scriptDraft, [rule.style.id]: styleDraft },
            },
        ];
    });

    return {
        info,
        settings,
        rules,
        modules,
        drafts,
    };
}