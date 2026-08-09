# User Javascript and CSS — Reimplementation TODO

> Features from the **original extension v3.1.2** vs the **new WXT+Vue+Monaco rebuild**.

---

## Legend

| Icon | Meaning                   |
| ---- | ------------------------- |
| ⬜   | Not started               |
| 🔶   | Partially done / has bugs |
| ✅   | Done                      |

---

## 1. Project Infrastructure

- [x] WXT framework scaffold + multi-browser config (Chrome, Firefox)
- [x] Vue 3 + TypeScript + `<script setup>` convention
- [x] Tailwind CSS v4 with `@tailwindcss/vite` plugin
- [x] Shadcn Vue UI components (Reka UI + CVA)
- [x] Pinia state management
- [x] Zod schemas for all data types (rules, settings, modules, drafts, storage)
- [x] Fixed Tailwind components (`cn()` utility)
- [x] i18n locales (en, fr — 62 keys each, full coverage)
- [x] Custom Vite plugin for Monaco editor bundling (tree-shaken features/languages)
- [x] Extension icons (16, 32, 48, 96, 128)
- [x] `components.json` for shadcn-vue registry
- [ ] Multi-browser testing/release scripts (Chrome, Firefox, Edge, Opera, Brave)
- [ ] Proper `package.json` description and name (currently "wxt-vue-starter")
- [ ] ESLint/Prettier configuration verified for all code
- [ ] JetBrains Mono font — verify if bundled (original had it)
- [ ] README documentation updated to reflect actual build status

---

## 2. Storage Layer (`src/lib/storage/`)

- [x] `StorageStoreFactory` — composable extend pattern (base → draft → item)
- [x] Reactive state: info, settings, rules, modules, drafts
- [x] `load()` / `save()` with `browser.storage.local`
- [x] Watch for cross-tab changes with emitter UUID + throttle
- [x] `reset()` to defaults
- [x] Draft management (create from item/type, discard, save, detect changes)
- [x] Item management (remove item + its draft)
- [x] `upload()` / `download()` for cloud sync via `browser.storage.sync`
- [x] GZIP compression via `CompressionStream` API
- [x] Sync conflict detection (timestamps)
- [x] File content stored as separate keys (`f:<id>`) to avoid quota issues
- [x] Zod validation on every write/read
- [x] Editor settings schemas (Monaco → minimap, Ace → keyboard, CodeMirror)
- [x] Theme/palette schemas (5 light, 7 dark)

### Storage Fixes Needed

- [ ] Test that `upload()`/`download()` actually work end-to-end
- [ ] Add retry logic for storage quota exceeded errors
- [ ] Handle `browser.storage.local.getBytesInUse` for cross-browser compat

---

## 3. Background Service Worker (`src/entrypoints/background/index.ts`)

**Status: ✅ Implemented**

- [x] **Initialize on install/startup**
    - [x] Load rules, settings, modules from storage
    - [x] Register all enabled user scripts via `userScripts.register()`
    - [x] Inject all enabled CSS via `scripting.insertCSS()`
- [x] **Rule injection via `chrome.userScripts` API (primary path)**
    - [x] Register JS rules as user scripts (`world: "MAIN"`)
    - [ ] Register CSS rules as user scripts (inject `<style>` element)
    - [x] Handle `document_start` vs `document_end` timing
    - [x] Firefox: request `"userScripts"` as optional_permission at runtime
- [x] **CSS injection via `chrome.scripting.insertCSS` (fallback/alternative)**
    - [x] Inject with `origin: "USER"` for proper cascade
    - [x] Track which CSS is injected per tab (TabManager pattern)
    - [x] Remove/replace CSS when rules change
- [x] **Fallback JS injection via `scripting.executeScript`**
    - [x] Use `world: "MAIN"` when `userScripts` API unavailable
    - [x] Handle all frames (`jsDeep` / recursive flag)
- [ ] **Message handling**
    - [ ] `update:rules` → re-register scripts + update tab CSS
    - [ ] `update:settings` → apply settings globally
    - [ ] `update:libs` → handle shared library changes
    - [x] `page:open` / `page:update` → track current tab URL (from content script)
    - [ ] `sandbox:compile` → receive SCSS compilation results
    - [ ] `get:info` → return matching rules for popup
- [x] **URL-based rule matching** (`matchUrl` / glob → regex)
- [x] **Tab tracking** — which rules/CSS are injected into which tab
- [ ] **`web_accessible_resources`** — make shared libs (jQuery, etc.) injectable
- [x] **Storage change watcher** — auto-reapply rules when storage changes

---

## 4. Content Script (`src/entrypoints/content/index.ts`)

**Status: ✅ Implemented**

- [x] Run at `document_start` on all `http://*/*` and `https://*/*`
- [x] **On page open:** send `{type: "page:open", url}` to background
- [x] **SPA navigation detection**
    - [x] Primary: Navigation API (`navigation.addEventListener("navigatesuccess", ...)`)
    - [x] Fallback: `popstate` + `hashchange` events
    - [ ] Debounce (500ms trailing)
- [x] Send `{type: "page:update", url}` on navigation

---

## 5. Popup (`src/entrypoints/popup/`)

- [x] PopupContainer — layout with header, body, footer
- [x] PopupHeader — extension name + version, settings gear icon → opens options
- [x] PopupBody — matching rules list filtered by current URL, "no rules" message, refresh banner after toggle
- [x] PopupFooter — "no access" warning, "new rule for host" button
- [x] `useCurrentTab` composable — queries active tab
- [x] `useHasAccess` composable — tests script execution capability

### Popup Improvements Needed

- [ ] Show current tab URL display (hostname at top)
- [ ] 🔶 Reload current tab button (exists, but only shown after rule toggle — not standalone)
- [ ] "View All" button → open options page
- [ ] Inspect element detection (check if page is restricted like `chrome://` URLs)
- [ ] Handle edge cases: restricted pages, no tab, multiple windows

---

## 6. Options Page — Rule Editing (`src/entrypoints/options/`)

### Editor / Code Editing

- [x] Monaco editor integration via `monaco-editor-vue3`
- [x] Syntax highlighting for JavaScript, TypeScript, CSS, SCSS
- [x] Language-appropriate options (font, minimap, word wrap, tab size, etc.)
- [x] Split-pane editor (TypeScript left, SCSS right) with resizable handle
- [x] Clipboard, comment, format, indentation, line operations
- [x] Find/replace with regex, goto symbol, reference search
- [x] Code folding, bracket matching, context menu, drag-and-drop
- [x] Sticky scroll, floating menu, code lens
- [x] Word highlighter, hover tooltips, parameter hints, inline completions
- [x] Multi-cursor, cursor undo, word operations
- [x] Intellisense / autocomplete for JS/TS and CSS/SCSS
- [x] Color picker for CSS colors
- [x] TypeScript compilation to JS (TypeScript compiler API)
- [ ] **🔶 Monaco theme hardcoded to `vs-dark`** — must use actual theme from settings
- [x] **🔶 TypeScript compiler** — `format()` bug fixed (now called with `output`)
- [ ] **🔶 SCSS compiler** — syntax errors, wrong return type, no output

### Additional Editor Features (from original)

- [ ] **Multiple editor support**: Ace and CodeMirror options (currently only Monaco)
- [ ] **14 editor themes from original**: chrome, cloud_editor, cloud_editor_dark, dawn, dracula, monokai, one_dark, solarized_dark, tomorrow, tomorrow_night, twilight, xcode, textmate
- [ ] **JavaScript code snippets** (35+ from original): proto, if/else, switch, for loops, try/catch, setTimeout, class, singleton, DOM helpers, etc.
- [ ] **Real-time JavaScript syntax checking** via web worker
- [ ] **SCSS/SASS snippets**
- [ ] **Customizable editor keybindings** (Vim, Emacs, Sublime for Ace)
- [ ] **CSS `!important` toggle** — wrap all CSS with `!important`
- [ ] **CSS live reload toggle** — auto-reinject CSS on change without page refresh

### Rule Management

- [x] Rule CRUD (add, select, edit, delete)
- [x] Rule draft system (unsaved changes detection, `beforeunload` warning)
- [x] URL pattern input and matching
- [x] Enable/disable toggle per rule
- [x] Sync checkbox per rule (for cloud sync)
- [x] Rule name editing
- [x] Sort rules (name A-Z, name Z-A, created, updated)
- [ ] **🔶 Updated sort** — currently broken (`sortRules.ts` comment: "Doesn't work")
- [ ] **Rule search/filter input** — exists in UI but no filtering logic
- [ ] **Duplicate rule** functionality (original had this)
- [ ] **Drag-and-drop reordering** of rules (original had this)
- [ ] **Rule flags panel**: deepCSS, isoCSS, jsDeep, jsIso, jsAtStart, styleImportant
- [ ] **Rule status indicators**: error/warning badges on rule items
- [ ] **Rule icon indicators**: show JS/CSS type per rule

### SCSS/SASS Compilation

- [x] Monaco configured for SCSS syntax highlighting
- [ ] **🔶 SCSS/SASS compilation** — file removed (`src/lib/compiler/scss.ts` no longer exists)
- [ ] **Web Worker approach** (replace original sandbox iframe)
    - [ ] Create `src/workers/sass-compiler.ts` with Dart Sass
    - [ ] Receive SCSS/SASS source, compile in worker thread
    - [ ] Return compiled CSS + sourcemap + errors
    - [ ] Handle `!important` post-processing
- [ ] **Fallback**: compile on main thread if worker fails

---

## 7. Options Page — Modules Tab

**Status: ⬜ STUBS** (ModuleContainer, ModuleHeader, ModuleReview are template-only)

- [ ] **Module CRUD** — create, edit, delete JS/CSS modules
- [ ] **Module editor** — code editor for module content (reuse `CodeEditor`)
- [ ] **Attach modules to rules** — select which modules a rule uses
- [ ] **Module sharing** — modules can depend on other modules
- [ ] **Import modules from internet**: npm packages, URLs, GitHub repos
- [ ] **Import from local files**: zip, js, css, html
- [ ] **Export modules** for sharing/backup
- [ ] **Module list in sidebar** — ModulesTab stub → full implementation
- [ ] **Module-to-module dependency resolution**

---

## 8. Options Page — Settings Tab

**Status: ✅ Implemented** (Editor, Theme, Extension, CloudSync, Storage sections)

- [x] **Editor selection**: Monaco / Ace / CodeMirror radio
- [x] **Theme selection**: light/dark + palette picker (5 light, 7 dark)
- [x] **Editor font family** (custom input, defaults to JetBrains Mono)
- [x] **Editor font size** number input
- [ ] **Cloud storage configuration**: Google Drive, OneDrive, Dropbox
    - [ ] OAuth flow for each provider
    - [ ] Sync trigger (manual or automatic)
- [x] **Language selection**: English / French
- [x] **Sync settings toggle**: enable/disable cloud sync
- [x] **Auto-enable dev mode toggle**: prompt user to enable developer mode
- [x] **Badge count setting**: show/hide rule count on extension icon
- [x] **Default sort** for rule list
- [ ] **Custom theme colors** (background, text, accent)

---

## 9. Options Page — About Tab

**Status: ⬜ STUB** (AboutTab is template-only)

- [ ] Extension version + build info
- [ ] Links to documentation, GitHub, Chrome Web Store
- [ ] Credits / licenses
- [ ] "Enable developer mode" instructions (with screenshots, like original had)

---

## 10. Code Compilation Pipeline

### TypeScript Compilation (`src/lib/compiler/typescript.ts`)

- [x] TypeScript compiler API integration
- [x] Transpile with `ScriptTarget.ESNext` / `ModuleKind.ESNext`
- [x] **🔶 Bug**: `format()` now correctly called with `output` instead of `source`
- [ ] **🔶 Empty `CompilerOptions`** interface — needs proper options
- [ ] **Beautify with Prettier** — wire up proper Prettier formatting after compilation
- [ ] **Error display** — show TypeScript compilation errors in the editor

### SCSS/SASS Compilation (`src/lib/compiler/scss.ts`)

- [ ] **🔶 Rewrite from scratch** — `src/lib/compiler/scss.ts` does not exist
- [ ] Use `sass.compileStringAsync()` from the `sass` npm package
- [ ] Support both `scss` and `indented` syntax
- [ ] Output styles: `expanded` (default) and `compressed`
- [ ] Source map generation
- [ ] Error reporting
- [ ] `!important` post-processing option

### Preview Dialog

- [ ] **🔶 Preview compilation** — currently commented out in ActionsBar
- [ ] Compile TypeScript → JS, SCSS → CSS
- [ ] Show compiled output in read-only editor
- [ ] Show compilation errors

---

## 11. Theme System

- [x] Light/dark theme detection (auto/manual)
- [x] 5 light palettes: dawn, tomorrow, xcode, cloud_editor, chrome
- [x] 7 dark palettes: dracula, monokai, one_dark, solarized_dark, tomorrow_night, twilight, cloud_editor_dark
- [x] CSS variable theming via `data-theme` and `data-theme-palette` attributes
- [x] `watchTheme()` composable — sets `document.documentElement.dataset.theme`
- [x] `watchThemePalette()` composable — sets `dataset.themePalette`
- [x] Theme colors mapped to Tailwind utility classes via `@theme inline`
- [ ] **Apply theme to Monaco editor** (currently hardcoded `vs-dark`)
- [ ] **Map extension palettes to Monaco themes** (Monokai → monokai theme, Dracula → dracula, etc.)
- [ ] **Ace/CodeMirror themes** when those editors are selected

---

## 12. Cloud Sync

- [x] Storage layer: `upload()` / `download()` with `browser.storage.sync`
- [x] GZIP compression with chunking (4096-byte segments)
- [x] Sync conflict detection (timestamp-based)
- [ ] **Cloud provider abstraction** — Google Drive, OneDrive, Dropbox
    - [ ] Each provider needs OAuth flow
    - [ ] Chrome: `chrome.identity` API
    - [ ] Firefox: alternative OAuth approach
- [ ] **Sync trigger UI** — manual sync button, automatic sync option
- [x] **Per-rule sync checkbox** (only synced rules are uploaded)
- [ ] **Sync status indicators** (last synced, conflict warning, free space, etc.)

---

## 13. Web Worker — Syntax Validation

Original extension had a JavaScript syntax checker web worker (`worker-javascript.js`).

- [ ] Create JavaScript/TypeScript syntax validation worker
- [ ] Real-time error/warning display in editor gutter
- [ ] Monaco already has this built-in — verify it works with current config

---

## 14. Web Worker — SCSS/SASS Compiler

- [ ] Create `src/workers/sass-compiler.ts`
- [ ] Bundle Dart Sass (`sass` npm package) as a Web Worker entry
- [ ] Define message protocol
- [ ] Register in WXT config so it's bundled separately
- [ ] Fallback: compile on main thread

---

## 15. Inline Popup Editor

(A feature mentioned in README — "write script from a popup window in the target page")

- [ ] Design: a popup that opens on the target page for quick script injection
- [ ] Not in original extension — this is a new feature
- [ ] Consider scope: could be a separate entrypoint or mode

---

## 16. State Management

- [x] `useStorage` Pinia store — rules, settings, modules, drafts
- [x] `useState` Pinia store — active tab, current draft, panel selection
- [x] `useDialog` / `useConfirm` Pinia stores — global dialogs
- [x] Cross-tab state synchronization via `browser.storage.onChanged`
- [x] Debounced/throttled storage writes (500ms)
- [x] Zod validation on every storage write/read
- [x] Deep merge for partial updates

---

## 17. Libraries & Utilities

- [x] `rules.ts` — URL pattern matching (glob → regex, include/exclude)
- [x] `utils.ts` — deep merge, clone, diff, pick, omit
- [x] `logger.ts` — styled console logger with levels
- [x] `errors.ts` — custom error classes for storage operations
- [x] `compression.ts` — GZIP compress/decompress via `CompressionStream`
- [x] `options.ts` / `panel.ts` — tab and panel enums
- [x] `sortRules.ts` — sort configurations
- [x] `tailwind.ts` — `cn()` utility

---

## 18. Assets & Branding

- [x] Extension icons in all sizes
- [ ] **JetBrains Mono font** — check if bundled in `src/public/fonts/`
- [ ] **jQuery 3.7.1** as web accessible resource — original had it for user scripts
- [ ] Screenshots for Chrome Web Store / Firefox Add-ons
- [ ] Documentation images (dev mode instructions, like original had)

---

## 19. Original Extension Features — Verification Checklist

| Feature                                    | Original | New    | Status                    |
| ------------------------------------------ | -------- | ------ | ------------------------- |
| Manifest V3                                | ✅       | ✅     | Done                      |
| Service worker background                  | ✅       | ✅     | Done                      |
| Content script (document_start)            | ✅       | ✅     | Done                      |
| SPA navigation detection (Navigation API)  | ✅       | ✅     | Done (+ history/fallback) |
| CSS injection via scripting.insertCSS      | ✅       | ✅     | Done                      |
| JS injection via userScripts API           | ✅       | ✅     | Done (with fallback)      |
| MAIN/USER_SCRIPT world selection           | ✅       | ✅     | Done                      |
| URL pattern matching (glob/regex)          | ✅       | ✅     | Done in lib               |
| Rule CRUD                                  | ✅       | ✅     | Done                      |
| Rule enable/disable toggle                 | ✅       | ✅     | Done                      |
| Rule flags (deep, iso, atStart, important) | ✅       | 🔶     | Partially in schema       |
| Popup: matching rules list                 | ✅       | ✅     | Done                      |
| Popup: toggle rules                        | ✅       | ✅     | Done                      |
| Popup: tab reload                          | ✅       | 🔶     | After toggle only         |
| Options: code editor                       | Ace      | Monaco | Different but functional  |
| Options: 14 themes                         | ✅       | 🔶     | Hardcoded vs-dark         |
| Options: JS snippets                       | 35+      | ⬜     | Not started               |
| Options: SCSS/SASS compilation             | ✅       | ⬜     | Not started               |
| Options: CSS !important toggle             | ✅       | 🔶     | In schema, not wired      |
| Options: drag-and-drop reorder             | ✅       | ⬜     | Not started               |
| Options: duplicate rule                    | ✅       | ⬜     | Not started               |
| Real-time syntax checking                  | ✅       | ✅     | Monaco built-in           |
| Web worker for editing                     | ✅       | ⬜     | Not started               |
| i18n (en, ru)                              | ✅       | ✅     | en, fr done               |
| Cloud sync (browser.storage.sync)          | ⬜       | ✅     | Extends original          |
| Cloud sync (Google Drive etc.)             | ⬜       | 🔶     | Schema exists             |
| Modules/libraries tab                      | ⬜       | 🔶     | Stubs exist               |
| Extended settings                          | ⬜       | ✅     | Editor, theme, ext, sync  |
| jQuery as web accessible resource          | ✅       | ⬜     | Not started               |

---

## 20. Bugs & Known Issues

- [ ] **MonacoEditor.vue:37** — theme hardcoded to `'vs-dark'` (`TODO à changer`)
- [x] **compiler/typescript.ts** — `format()` bug fixed (now correctly called with `output`)
- [ ] **compiler/scss.ts** — syntax errors (wrong import, wrong return type)
- [ ] **sortRules.ts** — "Updated" sort doesn't work (`// FIX`)
- [ ] **ActionsBar.vue** — preview compilation commented out
- [ ] **ActionsScript.vue** — 0-byte empty file (unused)
- [ ] **ActionsStyle.vue** — 0-byte empty file (unused)
- [ ] **Rule search input** — exists in RulesTab but no filtering logic
- [ ] **RuleListItem** — import of `useDraft` commented out (unused)

---

## 21. Testing & Quality

- [ ] Manual test: popup opens and shows rules for current URL
- [ ] Manual test: toggle rule from popup
- [ ] Manual test: create/edit/delete rule in options
- [ ] Manual test: SCSS compilation → CSS injection
- [ ] Manual test: TypeScript compilation → JS injection
- [ ] Manual test: CSS/JS injected on matching pages
- [ ] Manual test: SPA navigation detection
- [ ] Manual test: cross-tab state sync
- [ ] Manual test: cloud sync upload/download
- [ ] Manual test: Firefox compatibility
- [ ] Build and zip for Chrome + Firefox
- [ ] Lint check: `npm run compile` (vue-tsc)
- [ ] Verify no console errors in extension popup/options

---

## 22. Polish & DX

- [ ] `package.json` name/description from "wxt-vue-starter" to "user-javascript-and-css"
- [ ] Add `.env` for API keys (cloud sync OAuth)
- [ ] Document build/release process in README
- [ ] Clean up empty/stub files (ActionsScript.vue, ActionsStyle.vue)
- [ ] Remove unused imports
- [ ] Verify `IS_DEV` environment variable works in build

---

## 23. Toast Notifications

**Status: ✅ Implemented** (see ISSUES.md #2)

- [x] `useToast` composable — global reactive toast store (`push` / `remove`, auto-dismiss)
- [x] `GlobalToast.vue` — fixed top-right viewport, variants (success / error / info), close button
- [x] Mounted in `AppProvider.vue` → available in both options and popup
- [x] Toast on rule **created** / **updated** (Save button, `RuleHeader.vue`)
- [x] Toast on rule **deleted** (`MoreMenu.vue`)
- [x] Toast on rule **enabled / disabled** (list toggle `RuleListItem.vue`, MoreMenu checkbox)
- [x] Toast on settings **exported** / **imported** / **reset** (`StorageSection.vue`)
- [x] Toast on cloud sync **upload / download** success and failure (`CloudSyncSection.vue`)
- [x] i18n `TOAST_*` keys in `en` + `fr` (incl. module keys)
- [ ] Module toasts — blocked until Module CRUD UI is implemented (section 7 stubs)
