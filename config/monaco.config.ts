import type { MonacoOptions } from './withMonaco/types';

const isProduction = process.env.NODE_ENV === 'production';

export default {
    features: [
        // ======================================================
        // SELECTION & CURSOR
        // ======================================================
        'anchorSelect', // Enables anchor-based selection (Shift+Click style range selection)
        'cursorUndo', // Restores previous cursor positions independently of text undo
        'lineSelection', // Allows selecting entire lines via keyboard shortcuts
        'multicursor', // Supports multiple cursors and simultaneous editing
        'wordOperations', // Provides word-level cursor movement and deletion commands
        'wordPartOperations', // Moves cursor by sub‑word segments (e.g., camelCase parts)
        // 'caretOperations',           // Advanced caret movement and swapping operations
        // 'smartSelect',               // Expands or contracts selection based on code structure

        // ======================================================
        // EDITING & TEXT MANIPULATION
        // ======================================================
        'clipboard', // Integrates with system clipboard for copy/paste operations
        'comment', // Toggles line and block comments based on language rules
        'format', // Applies language-aware code formatting
        'indentation', // Manages indentation logic, guides, and auto-indentation
        'linesOperations', // Commands for duplicating, moving, or deleting entire lines
        'rename', // Renames symbols using language service support
        // 'inPlaceReplace',            // Replaces selected text with previous/next values (e.g., increment numbers)
        // 'insertFinalNewLine',        // Ensures files end with a newline on save
        // 'snippet',                   // Inserts and navigates through code snippets

        // ======================================================
        // NAVIGATION & SEARCH
        // ======================================================
        'find', // Provides the find/replace widget with regex and case options
        'gotoSymbol', // Jumps to symbols such as functions, classes, or variables
        'referenceSearch', // Finds all references to a symbol across the document
        'documentSymbols', // Extracts document symbols for outline views // TODO outline
        'quickCommand', // Opens the command palette for editor actions
        // 'gotoLine',                  // Jumps directly to a specific line number
        // 'gotoError',                 // Navigates between errors and warnings
        // 'quickOutline',              // Displays a quick symbol outline popup
        // 'quickHelp',                 // Shows contextual help for commands or symbols

        // ======================================================
        // INTELLISENSE & LANGUAGE SERVICES
        // ======================================================
        'codeAction', // Provides quick fixes, refactorings, and code actions
        'hover', // Displays hover tooltips with documentation or type info
        'inlineCompletions', // Shows inline ghost-text suggestions as you type // TODO à vérifier
        'parameterHints', // Displays function signature help during calls
        'tokenization', // Performs syntax tokenization for highlighting
        // 'inlayHints',                // Shows inline hints such as parameter names or inferred types
        // 'semanticTokens',            // Provides semantic highlighting based on language analysis
        // 'inspectTokens',             // Developer tool for inspecting tokenization
        // 'suggest',                   // Autocomplete suggestion widget

        // ======================================================
        // UI / RENDERING
        // ======================================================
        'codeEditor', // Core editor UI and layout engine
        'bracketMatching', // Highlights matching brackets and pairs
        // 'colorPicker',               // Requires web worker — fails in Firefox extension CSP
        'contextmenu', // Right‑click context menu with editor actions
        'dnd', // Drag‑and‑drop support for text and files
        'folding', // Code folding and fold region management
        'longLinesHelper', // Optimizes rendering for extremely long lines
        'middleScroll', // Enables middle‑click scrolling behavior
        'stickyScroll', // Shows sticky scope headers at the top while scrolling
        'floatingMenu', // Contextual floating toolbar for quick actions
        'readOnlyMessage', // Shows a message overlay when the editor is read‑only
        'codelens', // Inline metadata such as reference counts or actions
        // 'codicon',                   // Icon font used throughout Monaco (VS Code icons)
        // 'diffEditor',                // Side‑by‑side or inline diff viewer
        // 'diffEditorBreadcrumbs',     // Breadcrumb navigation inside the diff editor
        // 'fontZoom',                  // Zooms editor font size with Ctrl+Scroll
        // 'placeholderText',           // Displays placeholder text when the editor is empty
        // 'sectionHeaders',            // Displays section headers based on code structure
        // 'toggleHighContrast',        // Switches to a high‑contrast theme
        // 'toggleTabFocusMode',        // Toggles Tab key behavior between focus and indentation

        // ======================================================
        // LINKS, INPUT, AND INTERACTION
        // ======================================================

        // 'links',                     // Detects and opens clickable links in the editor
        // 'dropOrPasteInto',           // Handles dropping or pasting files, images, or content
        // 'iPadShowKeyboard',          // Forces the software keyboard to appear on iPad devices

        // ======================================================
        // SAFETY, VALIDATION & TEXT QUALITY
        // ======================================================

        'wordHighlighter', // Highlights occurrences of the currently selected symbol
        // 'unicodeHighlighter',        // Highlights ambiguous or invisible Unicode characters
        // 'unusualLineTerminators',    // Warns about problematic or non‑standard line endings

        // ======================================================
        // PLATFORM & INTERNAL
        // ======================================================

        'browser', // Browser‑specific utilities and polyfills
        // 'gpu',                       // GPU‑accelerated rendering pipeline
        // 'internal',                  // Internal Monaco utilities not intended for public use
    ],
    languages: ['typescript', 'css'],
    globalAPI: !isProduction,
} as const satisfies MonacoOptions;
