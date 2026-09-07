export default interface Messages {
    COMMON: {
        ABOUT: string;
        CANCEL: string;
        CLOSE: string;
        DRAFT: string;
        MODULES: string;
        NEW_MODULE: string;
        NEW_RULES: string;
        OPTIONS: string;
        RULES: string;
        SAVE: string;
        SCRIPT: string;
        SETTINGS: string;
        SORT: {
            TITLE: string;
            NAME_DESC: string;
            NAME_ASC: string;
            CREATED: string;
            UPDATED: string;
        };
        STYLE: string;
        FIND: string;
        REMOVE: string;
        COPY: string;
    };
    ABOUT: {
        CREDITS: string;
        CREDITS_DESCRIPTION: string;
        ENABLE_SCRIPTS: string;
        ENABLE_SCRIPTS_DESCRIPTION: string;
        ENABLE_SCRIPTS_STEP_1: string;
        ENABLE_SCRIPTS_STEP_2: string;
        ENABLE_SCRIPTS_STEP_3: string;
        GITHUB: string;
        GITHUB_DESCRIPTION: string;
        LINKS: string;
        PREVIOUS_DOCS: string;
        PREVIOUS_EXTENSION: string;
        PREVIOUS_EXTENSION_DESCRIPTION: string;
        PREVIOUS_IMPORT: string;
        PREVIOUS_IMPORT_DESCRIPTION: string;
        PREVIOUS_STORE: string;
        VERSION: string;
    };
    DIALOG: {
        CONFIRM: {
            CANCEL: string;
            CONFIRM: string;
            TITLE: string;
        };
        PREVIEW: {
            DESCRIPTION: string;
            TITLE: string;
        };
        SYNC: {
            DOWNLOAD_MESSAGE: string;
            DOWNLOAD_TITLE: string;
            LOCAL_EMITTER: WithPositionalArgs<1>;
            LOCAL_UPDATED: WithPositionalArgs<1>;
            REMOTE_EMITTER: WithPositionalArgs<1>;
            REMOTE_UPDATED: WithPositionalArgs<1>;
            UPLOAD_MESSAGE: string;
            UPLOAD_TITLE: string;
        };
    };
    DRAFT: {
        ALREADY_EXISTS: string;
        OPEN_EXISTING: string;
    };
    EDITOR: {
        ACTION_PANEL: {
            SCRIPT: {
                DESCRIPTION: string;
                TITLE: string;
            };
            STYLE: {
                DESCRIPTION: string;
                TITLE: string;
            };
        };
        BEAUTIFY: string;
        PREVIEW: string;
        PREVIEW_ERROR: {
            DESCRIPTION: string;
            TITLE: string;
        };
        RULE_NAME: string;
        RULE_NAME_EXAMPLE: string;
        SCRIPT_AT_START: {
            DESCRIPTION: string;
            TITLE: string;
        };
        SCRIPT_ISOLATED: {
            DESCRIPTION: string;
            TITLE: string;
        };
        SCRIPT_RECURSIVE: {
            DESCRIPTION: string;
            TITLE: string;
        };
        STYLE_IMPORTANT: {
            DESCRIPTION: string;
            TITLE: string;
        };
        STYLE_INJECTED: {
            DESCRIPTION: string;
            TITLE: string;
        };
        URL_PATTERN: string;
        URL_PATTERN_EXAMPLE: string;
        URL_PATTERN_TOOLTIP: string;
    };
    EXTENSION: {
        DESCRIPTION: string;
        NAME: string;
    };
    POPUP: {
        NEW: WithPositionalArgs<1>;
        NO_ACCESS: string;
        NO_RULES: string;
        REFRESH_NEEDED: {
            LINK: string;
            PREFIX: string;
            SUFFIX: string;
        };
    };
    RULES: {
        ADD_MODULE: string;
        ENABLED: string;
        NO_MODULES: string;
        PLACEHOLDER_SCRIPT: string;
        PLACEHOLDER_STYLE: string;
        REMOVE_ONE: string;
        REVERT: string;
        SYNC: string;
        SYNC_DESCRIPTION: string;
    };
    MODULES: {
        NAME: string;
        NAME_EXAMPLE: string;
        PACKAGE: string;
        PACKAGE_EXAMPLE: string;
        FILES: string;
        FILE: string;
        ADD_JS: string;
        ADD_CSS: string;
        REMOVE_FILE: string;
        TYPE: string;
        EMPTY: string;
        PLACEHOLDER_JS: string;
        PLACEHOLDER_CSS: string;
        REVERT: string;
        USED_BY: string;
        IMPORT: string;
        IMPORTS: string;
        QUICK_IMPORT: string;
        IMPORT_TITLE: string;
        IMPORT_PACKAGE: string;
        IMPORT_URL: string;
        IMPORT_PREVIEW: string;
        IMPORT_EMPTY: string;
        PACKAGE_PLACEHOLDER: string;
        URL_PLACEHOLDER: string;
        REFRESH: string;
        REFRESH_ALL: string;
        COLLAPSE: string;
        EXPAND: string;
        REMOTE: string;
        REMOTE_LINK_COPY: WithNamedArgs<['url']>;
    };
    SETTINGS: {
        BADGE_COUNT: string;
        BADGE_COUNT_DESCRIPTION: string;
        BADGE_COLOR: string;
        BADGE_COLOR_CUSTOM: string;
        BADGE_COLOR_DESCRIPTION: string;
        BADGE_COLOR_THEME: string;
        CLOUD_SYNC: string;
        DEFAULT_SORT: string;
        DEFAULT_SORT_DESCRIPTION: string;
        DEV_MODE: string;
        EDITOR: {
            ACE: string;
            CODEMIRROR: string;
            MONACO: string;
            TITLE: string;
            SELECT: string;
            SELECT_DESCRIPTION: string;
        };
        EXPORT: string;
        EXPORT_DESCRIPTION: string;
        EXTENSION: string;
        FONT_FAMILY: string;
        FONT_FAMILY_DESCRIPTION: string;
        FONT_SIZE: string;
        FONT_SIZE_DESCRIPTION: string;
        IMPORT: string;
        IMPORT_DESCRIPTION: string;
        IMPORT_LEGACY: string;
        IMPORT_LEGACY_CONFIRM: string;
        IMPORT_LEGACY_DESCRIPTION: string;
        INVISIBLE_CHARS: string;
        INVISIBLE_CHARS_DESCRIPTION: string;
        LANGUAGE: string;
        LANGUAGE_DESCRIPTION: string;
        LIGATURES: string;
        LIGATURES_DESCRIPTION: string;
        MINIMAP: string;
        MINIMAP_DESCRIPTION: string;
        SOFT_TABS: string;
        SOFT_TABS_DESCRIPTION: string;
        STORAGE: string;
        STORAGE_FREE: WithPositionalArgs<1>;
        STORAGE_USED: string;
        SYNC_DOWNLOAD: string;
        SYNC_DOWNLOAD_DESCRIPTION: string;
        SYNC_ENABLED: string;
        SYNC_ENABLED_DESCRIPTION: string;
        SYNC_FREQUENCY: {
            DESCRIPTION: string;
            LABEL: string;
            OPTIONS: {
                DAILY: string;
                HOURLY: string;
                WEEKLY: string;
            };
        };
        SYNC_LAST_SYNCED: string;
        SYNC_METHOD: {
            DESCRIPTION: string;
            LABEL: string;
            OPTIONS: {
                BOTH: string;
                PULL: string;
                PUSH: string;
            };
        };
        SYNC_NEVER: string;
        SYNC_STORAGE_LIMIT_REACHED: string;
        SYNC_STORAGE_USED: string;
        SYNC_STORAGE_WARNING: string;
        SYNC_UPLOAD: string;
        SYNC_UPLOAD_DESCRIPTION: string;
        TAB_SIZE: string;
        TAB_SIZE_DESCRIPTION: string;
        THEME: {
            AUTO: string;
            DARK: string;
            DARK_PALETTE: string;
            DARK_PALETTE_DESCRIPTION: string;
            LIGHT: string;
            LIGHT_PALETTE: string;
            LIGHT_PALETTE_DESCRIPTION: string;
            MODE: string;
            MODE_DESCRIPTION: string;
            TITLE: string;
        };
        WIPE_CONFIRM: string;
        WIPE_DATA: string;
        WIPE_DATA_DESCRIPTION: string;
        WORD_WRAP: string;
        WORD_WRAP_DESCRIPTION: string;
    };
    TOAST: {
        MODULE_CREATED: string;
        MODULE_DISABLED: string;
        MODULE_ENABLED: string;
        MODULE_IMPORTED: string;
        MODULE_IMPORT_FAILED: string;
        MODULE_REFRESHED: string;
        MODULE_REFRESH_FAILED: string;
        MODULE_REMOVED: string;
        MODULE_UPDATED: string;
        RULE_CREATED: string;
        RULE_DISABLED: string;
        RULE_ENABLED: string;
        RULE_REMOVED: string;
        RULE_UPDATED: string;
        SETTINGS_EXPORTED: string;
        SETTINGS_IMPORT_ERROR: string;
        SETTINGS_IMPORTED: string;
        SETTINGS_LEGACY_IMPORTED: string;
        SETTINGS_LEGACY_IMPORT_ERROR: string;
        SETTINGS_LEGACY_NOT_FOUND: string;
        SETTINGS_RESET: string;
        SYNC_DOWNLOAD_ERROR: string;
        SYNC_DOWNLOAD_SUCCESS: string;
        SYNC_UPLOAD_ERROR: string;
        SYNC_UPLOAD_SUCCESS: string;
        COPIED_TO_CLIPBOARD: string;
        COPY_FAILED: string;
        EDITOR: {
            BEAUTIFY_ERROR: {
                DESCRIPTION: string;
                TITLE: string;
            };
        };
    };
    URL_MATCH: {
        TITLE: string;
        TAB_SIMPLE: string;
        TAB_ADVANCED: string;
        SIMPLE: {
            URL: string;
            URL_PLACEHOLDER: string;
            URL_HINT: string;
            SCHEME: string;
            SCHEME_HTTPS: string;
            SCHEME_HTTP: string;
            SCHEME_ALL: string;
            SCHEME_UNRECOGNIZED: string;
            DOMAIN: string;
            DOMAIN_PLACEHOLDER: string;
            DOMAIN_WILDCARD: string;
            MATCH_ALL: string;
            SUBDOMAINS: string;
            STARTS_WITH: string;
            EXCLUDE: string;
            ADD: string;
            PATH_WILDCARD: string;
            PATH_PLACEHOLDER: string;
        };
        ADVANCED: {
            PATTERN: string;
            PATTERN_PLACEHOLDER: string;
            RULES_TITLE: string;
            RULE_SCHEME: string;
            RULE_DOMAIN: string;
            RULE_DELIMITER: string;
            OK_TITLE: string;
            OK_EXAMPLE_1: string;
            OK_EXAMPLE_2: string;
            OK_EXAMPLE_3: string;
            BAD_TITLE: string;
            BAD_EXAMPLE_1: string;
            BAD_EXAMPLE_2: string;
            BAD_EXAMPLE_3: string;
            AUTO_FIX: string;
            AUTO_FIX_DESC: string;
            AUTO_FIX_RESULT: string;
            ADD: string;
        };
        LIST: {
            TITLE: string;
            MATCHES: string;
            EXCLUSIONS: string;
            NONE: string;
            VALID: string;
            INVALID: string;
            REMOVE: string;
            CONVERTED: string;
        };
        ERRORS: {
            EMPTY: string;
            NO_SCHEME: string;
            INVALID_SCHEME: string;
            NO_PATH: string;
            MASKED_DOMAIN: string;
            INVALID_HOST: string;
        };
        WARNING: {
            STRICT_MATCH: string;
        };
    };
}
