import type Messages from '../_schema';

export default {
    COMMON: {
        ABOUT: 'À propos',
        CLOSE: 'Fermer',
        DRAFT: 'Brouillon',
        MODULES: 'Modules',
        NEW_RULES: 'Nouvelle règle',
        OPTIONS: 'Options',
        RULES: 'Règles',
        SAVE: 'Sauvegarder',
        SCRIPT: 'Typescript',
        SETTINGS: 'Paramètres',
        SORT: {
            TITLE: 'Trier',
            NAME_DESC: 'Nom (Z → A)',
            NAME_ASC: 'Nom (A → Z)',
            CREATED: 'Date de création',
            UPDATED: 'Date de modification',
        },
        STYLE: 'SCSS ou CSS',
        FIND: 'Rechercher',
    },
    DIALOG: {
        CONFIRM: {
            CANCEL: 'Annuler',
            CONFIRM: 'Continuer',
            TITLE: 'Confirmation',
        },
        PREVIEW: {
            DESCRIPTION:
                'Le code affiché est le code compilé. Il peut différer du code que vous avez écrit, mais il est celui qui sera exécuté sur la page. Le code est compilé à chaque fois que vous sauvegardez la règle.',
            TITLE: 'Aperçu',
        },
        SYNC: {
            DOWNLOAD_MESSAGE:
                'Voulez-vous vraiment télécharger vos paramètres depuis le cloud ? Cette action ne peut pas être annulée.',
            DOWNLOAD_TITLE: 'Télécharger les paramètres',
            LOCAL_EMITTER: 'Instance locale : {0}',
            LOCAL_UPDATED: 'Dernière mise à jour locale : {0}',
            REMOTE_EMITTER: 'Instance distante : {0}',
            REMOTE_UPDATED: 'Dernière mise à jour distante : {0}',
            UPLOAD_MESSAGE:
                'Voulez-vous vraiment envoyer vos paramètres vers le cloud ? Cette action ne peut pas être annulée.',
            UPLOAD_TITLE: 'Envoyer les paramètres',
        },
    },
    DRAFT: {
        ALREADY_EXISTS:
            'Un brouillon existe déjà. Si vous continuez, il sera supprimé. Voulez-vous continuer ?',
        OPEN_EXISTING: 'Ouvrir le brouillon existant',
    },
    EDITOR: {
        ACTION_PANEL: {
            SCRIPT: {
                DESCRIPTION:
                    "L'éditeur de script support Typescript et donc par extension Javascript. Le code est ensuite compilé en Javascript au moment de l'enregistrement.",
                TITLE: 'Script',
            },
            STYLE: {
                DESCRIPTION:
                    "L'éditeur de style support SCSS et donc par extension CSS. Si le style de contient aucun charactère '{};', le mode SASS est activé.",
                TITLE: 'Style',
            },
        },
        BEAUTIFY: 'Formater le code',
        PREVIEW: 'Afficher le code compilé',
        PREVIEW_ERROR: {
            DESCRIPTION: "Une erreur est survenue lors de la génération de l'aperçu.",
            TITLE: 'Erreur',
        },
        RULE_NAME: 'Nom de la règle',
        RULE_NAME_EXAMPLE: 'ex. Ma règle',
        SCRIPT_AT_START: {
            DESCRIPTION:
                'Si cette option est activée, le script est injecté avant la construction du DOM, sinon après, mais avant le chargement des ressources telles que les images et les cadres.',
            TITLE: 'Exécuter au démarrage',
        },
        SCRIPT_ISOLATED: {
            DESCRIPTION:
                "Si activté, le script est exécuté dans un environnement isolé où le contexte de la page n'est pas disponible à l'exception du DOM.",
            TITLE: 'Environnement isolé',
        },
        SCRIPT_RECURSIVE: {
            DESCRIPTION:
                "Si cette option est activée, le code sera injecté dans tous les cadres. Chaque cadre est vérifié par rapport à l'URL.",
            TITLE: 'Tous les cadres',
        },
        STYLE_IMPORTANT: {
            DESCRIPTION: 'Auto !important for all properties',
            TITLE: 'Important',
        },
        STYLE_INJECTED: {
            DESCRIPTION:
                'Si cette option est activée, les styles ont initialement une faible priorité, mais celle-ci est maximisée avec !important. Sinon, les styles sont injectés dans une base de styles DOM.',
            TITLE: 'Injection programmatiquement',
        },
        URL_PATTERN: "Modèle de l'URL",
        URL_PATTERN_EXAMPLE: 'https://site.com/*, !https://site.com/excluded/*',
    },
    EXTENSION: {
        DESCRIPTION: 'Injecte du JavaScript et du CSS personnalisés dans les pages web.',
        NAME: 'User Javascript and CSS',
    },
    POPUP: {
        NEW: 'Nouvelle règle: {0}',
        NO_ACCESS: "Il semble que l'extension n'a pas accés à cette page.",
        NO_RULES: 'Pas encore de règles, ajoutez-en une !',
        REFRESH_NEEDED: {
            LINK: 'recharger la page',
            PREFIX: 'Pour appliquer les changements, il faut ',
            SUFFIX: '.',
        },
    },
    RULES: {
        ADD_MODULE: 'En ajouter un',
        ENABLED: 'Règle activé',
        NO_MODULES: 'Aucun modules',
        PLACEHOLDER_SCRIPT: 'Commencer à développer votre script Typescript ici ...',
        PLACEHOLDER_STYLE: 'Commencer à développer votre style SCSS ici ...',
        REMOVE_ONE: 'Supprimer la règle',
        REVERT: 'Annuler les changements',
        SYNC: 'Sauvegarder dans le cloud',
        SYNC_DESCRIPTION:
            'Peut être désactivé pour économiser de la place. La synchronisation fonctionne uniquement manuellement.',
    },
    SETTINGS: {
        BADGE_COUNT: "Compteur sur l'icône",
        BADGE_COUNT_DESCRIPTION: "Afficher le nombre de règles sur l'icône",
        BADGE_COLOR: 'Couleur du badge',
        BADGE_COLOR_CUSTOM: 'Personnalisée',
        BADGE_COLOR_DESCRIPTION: 'Couleur de fond du badge de l’extension',
        BADGE_COLOR_THEME: 'Suivre le thème',
        CLOUD_SYNC: 'Synchronisation cloud',
        DEFAULT_SORT: 'Tri par défaut',
        DEFAULT_SORT_DESCRIPTION: 'Ordre de tri par défaut de la liste des règles',
        DEV_MODE: 'Activer automatiquement le mode développeur',
        EDITOR: {
            ACE: 'Ace',
            CODEMIRROR: 'CodeMirror',
            MONACO: 'Monaco',
            TITLE: 'Éditeur',
            SELECT: "Type d'éditeur",
            SELECT_DESCRIPTION: "Éditeur de code utilisé pour les règles et les modules",
        },
        EXPORT: 'Exporter en JSON',
        EXPORT_DESCRIPTION:
            'Télécharge toutes les règles, modules et paramètres dans un fichier de sauvegarde JSON',
        EXTENSION: 'Extension',
        FONT_FAMILY: 'Police',
        FONT_FAMILY_DESCRIPTION: 'Police utilisée dans l’éditeur de code',
        FONT_SIZE: 'Taille de police',
        FONT_SIZE_DESCRIPTION: 'Taille du texte dans l’éditeur de code, en pixels',
        IMPORT: 'Importer depuis JSON',
        IMPORT_DESCRIPTION:
            'Restaure les règles, modules et paramètres depuis un fichier de sauvegarde JSON',
        INVISIBLE_CHARS: 'Caractères invisibles',
        INVISIBLE_CHARS_DESCRIPTION: 'Affiche les espaces, tabulations et fins de ligne dans l’éditeur',
        LANGUAGE: 'Langue',
        LANGUAGE_DESCRIPTION: "Langue utilisée pour l'interface de l'extension",
        LIGATURES: 'Activer les ligatures',
        LIGATURES_DESCRIPTION: 'Active les ligatures de police dans l’éditeur de code',
        MINIMAP: 'Afficher la minimap',
        MINIMAP_DESCRIPTION:
            'Affiche un aperçu miniature du code sur le côté de l’éditeur',
        SOFT_TABS: 'Tabulations souples',
        SOFT_TABS_DESCRIPTION: 'Utilise des espaces au lieu de tabulations quand vous appuyez sur Tab',
        STORAGE: 'Stockage',
        SYNC_DOWNLOAD: 'Télécharger du cloud',
        SYNC_DOWNLOAD_DESCRIPTION:
            'Remplace les paramètres locaux par ceux stockés dans le cloud',
        SYNC_ENABLED: 'Activer la synchro cloud',
        SYNC_ENABLED_DESCRIPTION:
            'Compare périodiquement les paramètres locaux avec le cloud et les synchronise automatiquement.',
        SYNC_FREQUENCY: {
            LABEL: 'Fréquence de synchronisation',
            DESCRIPTION: "À quelle fréquence l'extension vérifie les mises à jour dans le cloud.",
            OPTIONS: {
                HOURLY: 'Chaque heure',
                DAILY: 'Chaque jour',
                WEEKLY: 'Chaque semaine',
            },
        },
        SYNC_LAST_SYNCED: 'Dernière synchro',
        SYNC_METHOD: {
            LABEL: 'Méthode de synchronisation',
            DESCRIPTION:
                "L'extension pousse les changements locaux, tire les changements distants, ou les deux.",
            OPTIONS: {
                BOTH: 'Pousser et tirer',
                PULL: 'Tirer uniquement',
                PUSH: 'Pousser uniquement',
            },
        },
        SYNC_NEVER: 'Jamais',
        SYNC_UPLOAD: 'Uploader vers le cloud',
        SYNC_UPLOAD_DESCRIPTION: 'Remplace les paramètres du cloud par ceux de la machine',
        TAB_SIZE: 'Taille des tabulations',
        TAB_SIZE_DESCRIPTION: 'Nombre d’espaces utilisées pour chaque tabulation',
        THEME: {
            AUTO: 'Auto',
            DARK: 'Sombre',
            DARK_PALETTE: 'Palette sombre',
            DARK_PALETTE_DESCRIPTION: 'Palette de couleurs utilisée quand le thème sombre est actif',
            LIGHT: 'Clair',
            LIGHT_PALETTE: 'Palette claire',
            LIGHT_PALETTE_DESCRIPTION: 'Palette de couleurs utilisée quand le thème clair est actif',
            MODE: 'Mode du thème',
            MODE_DESCRIPTION:
                'Bascule entre l’apparence claire et sombre, ou suit le système',
            TITLE: 'Thème',
        },
        WIPE_CONFIRM:
            'Cela supprimera définitivement toutes les règles, modules et paramètres. Êtes-vous sûr ?',
        WIPE_DATA: 'Tout effacer',
        WIPE_DATA_DESCRIPTION: 'Supprime définitivement toutes les règles, modules et paramètres',
        WORD_WRAP: 'Retour à la ligne',
        WORD_WRAP_DESCRIPTION: 'Retourne les lignes longues au lieu de défiler horizontalement',
    },
    TOAST: {
        MODULE_CREATED: 'Module créé',
        MODULE_DISABLED: 'Module désactivé',
        MODULE_ENABLED: 'Module activé',
        MODULE_REMOVED: 'Module supprimé',
        MODULE_UPDATED: 'Module sauvegardé',
        RULE_CREATED: 'Règle créée',
        RULE_DISABLED: 'Règle désactivée',
        RULE_ENABLED: 'Règle activée',
        RULE_REMOVED: 'Règle supprimée',
        RULE_UPDATED: 'Règle sauvegardée',
        SETTINGS_EXPORTED: 'Paramètres exportés',
        SETTINGS_IMPORT_ERROR:
            "Import échoué : le fichier sélectionné n'est pas une sauvegarde valide",
        SETTINGS_IMPORTED: 'Paramètres importés',
        SETTINGS_RESET: 'Toutes les données ont été réinitialisées',
        SYNC_DOWNLOAD_ERROR: 'Échec du téléchargement des paramètres depuis le cloud',
        SYNC_DOWNLOAD_SUCCESS: 'Paramètres téléchargés depuis le cloud',
        SYNC_UPLOAD_ERROR: "Échec de l'envoi des paramètres vers le cloud",
        SYNC_UPLOAD_SUCCESS: 'Paramètres envoyés vers le cloud',
    },
} as const satisfies Messages;
