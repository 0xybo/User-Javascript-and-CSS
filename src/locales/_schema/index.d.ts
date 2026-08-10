export default interface Messages {
    COMMON: {
        ABOUT: string;
        CLOSE: string;
        DRAFT: string;
        MODULES: string;
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
    SETTINGS: {
        BADGE_COUNT: string;
        BADGE_COUNT_DESCRIPTION: string;
        CLOUD_SYNC: string;
        DEFAULT_SORT: string;
        DEV_MODE: string;
        EDITOR: {
            ACE: string;
            CODEMIRROR: string;
            MONACO: string;
            TITLE: string;
            SELECT: string;
        };
        EXPORT: string;
        EXTENSION: string;
        FONT_FAMILY: string;
        FONT_SIZE: string;
        IMPORT: string;
        INVISIBLE_CHARS: string;
        LANGUAGE: string;
        LIGATURES: string;
        MINIMAP: string;
        SOFT_TABS: string;
        STORAGE: string;
        SYNC_DOWNLOAD: string;
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
        SYNC_UPLOAD: string;
        TAB_SIZE: string;
        THEME: {
            AUTO: string;
            DARK: string;
            DARK_PALETTE: string;
            LIGHT: string;
            LIGHT_PALETTE: string;
            MODE: string;
            TITLE: string;
        };
        WIPE_CONFIRM: string;
        WIPE_DATA: string;
        WORD_WRAP: string;
    };
    TOAST: {
        MODULE_CREATED: string;
        MODULE_DISABLED: string;
        MODULE_ENABLED: string;
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
        SETTINGS_RESET: string;
        SYNC_DOWNLOAD_ERROR: string;
        SYNC_DOWNLOAD_SUCCESS: string;
        SYNC_UPLOAD_ERROR: string;
        SYNC_UPLOAD_SUCCESS: string;
    };
}
