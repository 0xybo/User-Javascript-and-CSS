import type Messages from '../_schema';

export default {
    COMMON: {
        ABOUT: 'About',
        CLOSE: 'Close',
        DRAFT: 'Draft',
        MODULES: 'Modules',
        NEW_RULES: 'New Rule',
        OPTIONS: 'Options',
        RULES: 'Rules',
        SAVE: 'Save',
        SCRIPT: 'Typescript',
        SETTINGS: 'Settings',
        SORT: {
            TITLE: 'Sort',
            NAME_DESC: 'Name (Z → A)',
            NAME_ASC: 'Name (A → Z)',
            CREATED: 'Creation Date',
            UPDATED: 'Update Date',
        },
        STYLE: 'SCSS or CSS',
        FIND: 'Find',
    },
    DIALOG: {
        CONFIRM: {
            CANCEL: 'Cancel',
            CONFIRM: 'Continue',
            TITLE: 'Confirmation',
        },
        PREVIEW: {
            DESCRIPTION:
                'The code shown is the compiled code. It may differ from the code you wrote, but it is the one that will be executed on the page. The code is compiled every time you save the rule.',
            TITLE: 'Preview',
        },
    },
    DRAFT: {
        ALREADY_EXISTS:
            'A draft already exists. If you continue, it will be deleted. Do you want to continue?',
        OPEN_EXISTING: 'Open existing draft',
    },
    EDITOR: {
        ACTION_PANEL: {
            SCRIPT: {
                DESCRIPTION:
                    'The script editor supports Typescript and therefore, by extension, Javascript. The code is then compiled into Javascript when saved.',
                TITLE: 'Script',
            },
            STYLE: {
                DESCRIPTION:
                    'The style editor supports SCSS and, by extension, CSS. If the style does not contain any ‘{};’ characters, SASS mode is enabled. The style is then compiled into CSS when saved.',
                TITLE: 'Style',
            },
        },
        BEAUTIFY: 'Beautify',
        PREVIEW: 'Preview compiled code',
        PREVIEW_ERROR: {
            DESCRIPTION: 'An error occurred while generating the preview.',
            TITLE: 'Error',
        },
        RULE_NAME: 'Rule name',
        RULE_NAME_EXAMPLE: 'ex. My new rule',
        SCRIPT_AT_START: {
            DESCRIPTION:
                'If enabled, the script is injected before the DOM is build, otherwise after, but before resources such as images and frames are loaded.',
            TITLE: 'Run at the start',
        },
        SCRIPT_ISOLATED: {
            DESCRIPTION:
                'If enabled, the script is executed in an isolated environment where the page context is not available except for the DOM.',
            TITLE: 'Isolated environment',
        },
        SCRIPT_RECURSIVE: {
            DESCRIPTION:
                'If this option is enabled, the code will be injected into all frames. Each frame is checked against the URL.',
            TITLE: 'All frames',
        },
        STYLE_IMPORTANT: {
            DESCRIPTION: 'Auto !important for all properties',
            TITLE: 'Important',
        },
        STYLE_INJECTED: {
            DESCRIPTION:
                'If this option is enabled, styles initially have low priority, but this is maximized with !important. Otherwise, styles are injected into a DOM style base.',
            TITLE: 'Programmatic injection',
        },
        URL_PATTERN: 'URL pattern',
        URL_PATTERN_EXAMPLE: 'https://site.com/*, !https://site.com/excluded/*',
    },
    EXTENSION: {
        DESCRIPTION: 'Inject custom JavaScript and CSS into web pages.',
        NAME: 'User Javascript and CSS',
    },
    POPUP: {
        NEW: 'New rule: {0}',
        NO_ACCESS: "Looks like the extension doesn't have access to this page",
        NO_RULES: 'No rules yet, add a new one',
        REFRESH_NEEDED: {
            LINK: 'refresh the page',
            PREFIX: 'To apply changes, you need to ',
            SUFFIX: '.',
        },
    },
    RULES: {
        ADD_MODULE: 'Add one',
        ENABLED: 'Rule enabled',
        NO_MODULES: 'No modules',
        PLACEHOLDER_SCRIPT: 'Start typing Typescript here ...',
        PLACEHOLDER_STYLE: 'Start typing SCSS here ...',
        REMOVE_ONE: 'Remove rule',
        REVERT: 'Cancel changes',
        SYNC: 'Save to cloud',
        SYNC_DESCRIPTION:
            'Can be turned off to save space. Synchronisation works only in manual mode.',
    },
    SETTINGS: {
        BADGE_COUNT: 'Badge counter',
        BADGE_COUNT_DESCRIPTION: 'Show rule count on extension icon',
        CLOUD_SYNC: 'Cloud sync',
        DEFAULT_SORT: 'Default sort',
        DEV_MODE: 'Auto-enable developer mode',
        EDITOR: {
            ACE: 'Ace',
            CODEMIRROR: 'CodeMirror',
            MONACO: 'Monaco',
            TITLE: 'Editor',
            SELECT: 'Editor type',
        },
        EXPORT: 'Export as JSON',
        EXTENSION: 'Extension',
        FONT_FAMILY: 'Font family',
        FONT_SIZE: 'Font size',
        IMPORT: 'Import from JSON',
        INVISIBLE_CHARS: 'Invisible characters',
        LANGUAGE: 'Language',
        LIGATURES: 'Enable ligatures',
        MINIMAP: 'Show minimap',
        SOFT_TABS: 'Soft tabs',
        STORAGE: 'Storage',
        SYNC_DOWNLOAD: 'Download from cloud',
        SYNC_ENABLED: 'Enable cloud sync',
        SYNC_LAST_SYNCED: 'Last synced',
        SYNC_NEVER: 'Never',
        SYNC_UPLOAD: 'Upload to cloud',
        TAB_SIZE: 'Tab size',
        THEME: {
            AUTO: 'Auto',
            DARK: 'Dark',
            DARK_PALETTE: 'Dark palette',
            LIGHT: 'Light',
            LIGHT_PALETTE: 'Light palette',
            MODE: 'Theme mode',
            TITLE: 'Theme',
        },
        WIPE_CONFIRM: 'This will permanently delete all rules, modules and settings. Are you sure?',
        WIPE_DATA: 'Wipe all data',
        WORD_WRAP: 'Word wrap',
    },
    TOAST: {
        MODULE_CREATED: 'Module created',
        MODULE_DISABLED: 'Module disabled',
        MODULE_ENABLED: 'Module enabled',
        MODULE_REMOVED: 'Module removed',
        MODULE_UPDATED: 'Module saved',
        RULE_CREATED: 'Rule created',
        RULE_DISABLED: 'Rule disabled',
        RULE_ENABLED: 'Rule enabled',
        RULE_REMOVED: 'Rule removed',
        RULE_UPDATED: 'Rule saved',
        SETTINGS_EXPORTED: 'Settings exported',
        SETTINGS_IMPORT_ERROR: 'Import failed: the selected file is not a valid backup',
        SETTINGS_IMPORTED: 'Settings imported',
        SETTINGS_RESET: 'All data has been reset to defaults',
        SYNC_DOWNLOAD_ERROR: 'Failed to download settings from the cloud',
        SYNC_DOWNLOAD_SUCCESS: 'Settings downloaded from the cloud',
        SYNC_UPLOAD_ERROR: 'Failed to upload settings to the cloud',
        SYNC_UPLOAD_SUCCESS: 'Settings uploaded to the cloud',
    },
} as const satisfies Messages;
