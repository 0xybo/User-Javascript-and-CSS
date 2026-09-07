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
- [x] Handle `browser.storage.local.getBytesInUse` for cross-browser compat (uses
      `@wxt-dev/browser` typing; fallback quota constants in the UI sections)

---

## 3. Background Service Worker (`src/entrypoints/background/index.ts`)

**Status: ✅ Implemented**

- [x] **Initialize on install/startup**
    - [x] Load rules, settings, modules from storage
    - [x] Register all enabled user scripts via `userScripts.register()`
    - [x] Inject all enabled CSS via `scripting.insertCSS()`
- [x] **Rule injection via `chrome.userScripts` API (primary path)**
    - [x] Register JS rules as user scripts (`world: "MAIN"`)
    - [x] Register CSS rules as user scripts (inject `<style>` element) — companion script
          `<id>:css` at `document_start`, all frames, deterministic element id
          `ujc-css-<ruleId>` with a MutationObserver guard; skipped when the rule uses the
          API-injected path (`style.injected`)
    - [x] Handle `document_start` vs `document_end` timing
    - [x] Firefox: request `"userScripts"` as optional_permission at runtime
- [x] **CSS injection via `chrome.scripting.insertCSS` (fallback/alternative)**
    - [x] Inject with `origin: "USER"` for proper cascade
    - [x] Track which CSS is injected per tab (TabManager pattern)
    - [x] Remove/replace CSS when rules change
- [x] **Badge on the extension icon** — count of enabled rules matching the active tab URL
      (`src/lib/background/badge.ts`), honoring the `badgeCount` setting
- [x] **Badge color setting** — follow the current extension theme (per-palette color) or a custom
      color (`badgeColorMode` / `badgeColor`), with the resolved light/dark theme persisted in
      `info.theme` by the options/popup pages so the service worker can apply it
- [x] **Fallback JS injection via `scripting.executeScript`**
    - [x] Use `world: "MAIN"` when `userScripts` API unavailable
    - [x] Handle all frames (`jsDeep` / recursive flag)
    - [x] Gate per-tab re-injection on `isPersistentlyRegistered()` so fallback rules keep
          being injected on every navigation (previously `isRegistered()` also matched the
          fallback marker, which silently disabled fallback injection)
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
- [x] **CSS `!important` toggle** — applied at compile time (`compileSCSS({ important })` from
      the draft save pipeline); re-saving a rule with the toggle flips regenerates the compiled CSS
- [x] **CSS live reload toggle** — CSS changes are re-applied to every matching open tab from the
      background storage watcher (differential: unchanged rules are not touched; `page:update`
      SPA updates reuse existing injections instead of flashing)

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
- [x] **Rule flags panel**: deepCSS, isoCSS, jsDeep, jsIso, jsAtStart, styleImportant — toggles in
      `ActionsBar.vue`, persisted in the schema, honored by the injection engine (`isolated` →
      `USER_SCRIPT`/`ISOLATED` world, `recursive` → all frames, `atStart` → `document_start`/
      `injectImmediately`, `injected` → API vs programmatic `<style>`, `important` → compile time)
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

**Status: 🔶 Implemented — CRUD + remote imports + flexible editors; advanced features pending**

- [x] **Module CRUD** — create, edit, delete JS/CSS modules
    - [x] `ModulesTab.vue` (sidebar): module list w/ search + "New module" button (reuses the
          existing draft/dialog flow)
    - [x] `ModuleListItem.vue` / `ModuleList.vue`: list rows with unsaved-change dot, name + file
          summary (JS/CSS), open on click
    - [x] `ModuleContainer.vue` (panel root): assembles `ModuleHeader` + `ModuleEditors` +
          `ModuleReview`, Ctrl+S save
    - [x] `ModuleHeader.vue`: name + package inputs, "Add JavaScript / Add CSS" buttons, Save
          button (toast on create/updated), `ModuleMoreMenu`
    - [x] `ModuleMoreMenu.vue`: sync checkbox, revert, remove
    - [x] `ModuleReview.vue`: "Used by" — lists rules that attach this module
    - [x] Storage helpers: `addModuleFile` / `removeModuleFile` (in `draft.ts`) + `State`
          delegates, i18n `MODULES.*` keys (en + fr)
- [x] **Module editor** — code editor for module content (reuse `CodeEditor`)
- [x] **Flexible editor layout** — per-file panels built on the shadcn/reka **vertical**
      `ResizablePanelGroup` (`size-unit="px"`, min 90px, `collapsible` slot API collapsing to
      80px), with **resize handles** between files, header **drag-and-drop reorder**, and a
      chevron **collapse** toggle
- [x] **Per-file ActionsBar extension** — local module files now get a working **Beautify** action
      (plus preview/settings on the rule editors): `ActionsBar` operates on the editor model
      instead of being hard-wired to the rule draft files
- [x] **Import dialog** — `ModuleImport.vue` opens a dialog (toolbar "Imports" + sidebar "Quick
      import") with a **package / url toggle**, a source input and a **live debounced preview**
      (fetches via jsDelivr CDN / URL through `src/lib/module-import.ts`, then shows the content,
      a spinner or an error). **Import** resolves the source, detects JS/CSS from the URL and
      content-type, and adds it as a read-only **remote** file (`src` set, editor `readonly`, no
      `ActionsBar`). In **quick mode** a new module named after the package/url is created and
      switched to (existing "New Module" draft-conflict is handled by a confirm dialog)
- [x] **Refresh** — per-file refresh button on remote files + "Refresh" toolbar button re-fetching
      all imported files (`refreshModuleFile` / `refreshAllModuleFiles`); `saveModuleDraft` skips
      `src` files so imported content isn't wiped on save
- [x] **Attach modules to rules** — select which modules a rule uses (`ModulesMenu.vue` already
      worked on the rule side)
- [ ] **Module sharing** — modules can depend on other modules
- [ ] **Import modules from internet**: GitHub repos, multi-file packages
- [ ] **Import from local files**: zip, js, css, html
- [ ] **Export modules** for sharing/backup
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
- [x] **Auto-sync options**: frequency (hourly/daily/weekly) + method (push/pull/both)
- [x] **Auto-enable dev mode toggle**: prompt user to enable developer mode
- [x] **Badge count setting**: show/hide rule count on extension icon
- [x] **Badge color setting**: follow the theme or custom color
- [x] **Descriptions for all settings**: every setting in the settings panel has a short
      description (en + fr)
- [x] **Default sort** for rule list
- [ ] **Custom theme colors** (background, text, accent)

---

## 9. Options Page — About Tab

**Status: ✅ Implemented** (extension info, links, previous extension, credits, user scripts)

- [x] Extension version + build info (manifest name, version, description)
- [x] Links to GitHub (this project) and to the previous extension (docs + Chrome Web Store)
- [x] Credits / licenses (open source libraries used)
- [x] "Enable user scripts" instructions (chrome://extensions + Allow User Scripts, text-only — no
      screenshots bundled)

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

- [x] **Preview compilation** — compile the current script (TS/JS → JS) or style (SCSS → CSS) and
      show the output in a read-only editor dialog (`ActionsBar.onPreviewButtonClick` →
      `PreviewDialog`)
- [x] Show compilation errors (dialog with the error message when the compilation yields nothing)

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
- [x] **Sync trigger UI** — manual upload/download with confirmation popup (`useDialog`)
- [x] **Auto-sync** — `browser.alarms` background timer; frequency (hourly/daily/weekly) and method
      (push/pull/both) settings; safe changes applied automatically, data-loss risk notifies user
- [x] **Per-rule sync checkbox** (only synced rules are uploaded)
- [x] **Sync status indicators** (conflict warning, free space, etc.) — last synced time displayed,
      free-space progress bar in the Cloud Sync section (see ISSUES.md #17)

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

- [x] `rules.ts` — URL pattern matching (glob → regex, include/exclude) + popup utilities
      (`splitPatterns`, `fixPattern`, `getPatternError`, `buildPatternFromOptions`, `parseUrlForOptions`)
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
| JS injection via userScripts API           | ✅       | ✅     | Done (all flags + fallback) |
| MAIN/USER_SCRIPT world selection           | ✅       | ✅     | Done                      |
| URL pattern matching (glob/regex)          | ✅       | ✅     | Done in lib               |
| Rule CRUD                                  | ✅       | ✅     | Done                      |
| Rule enable/disable toggle                 | ✅       | ✅     | Done                      |
| Rule flags (deep, iso, atStart, important) | ✅       | ✅     | Done (injection engine)   |
| Popup: matching rules list                 | ✅       | ✅     | Done                      |
| Popup: toggle rules                        | ✅       | ✅     | Done                      |
| Popup: tab reload                          | ✅       | 🔶     | After toggle only         |
| Options: code editor                       | Ace      | Monaco | Different but functional  |
| Options: 14 themes                         | ✅       | 🔶     | Hardcoded vs-dark         |
| Options: JS snippets                       | 35+      | ⬜     | Not started               |
| Options: SCSS/SASS compilation             | ✅       | ⬜     | Not started               |
| Options: CSS !important toggle             | ✅       | ✅     | Done (compile time)       |
| Options: drag-and-drop reorder             | ✅       | ⬜     | Not started               |
| Options: duplicate rule                    | ✅       | ⬜     | Not started               |
| Real-time syntax checking                  | ✅       | ✅     | Monaco built-in           |
| Web worker for editing                     | ✅       | ⬜     | Not started               |
| i18n (en, ru)                              | ✅       | ✅     | en, fr done               |
| Cloud sync (browser.storage.sync)          | ⬜       | ✅     | Extends original          |
| Cloud sync (Google Drive etc.)             | ⬜       | 🔶     | Schema exists             |
| Modules/libraries tab                      | ⬜       | 🔶     | CRUD+editor done; import/export pending |
| Extended settings                          | ⬜       | ✅     | Editor, theme, ext, sync  |
| jQuery as web accessible resource          | ✅       | ⬜     | Not started               |

---

## 20. Bugs & Known Issues

- [x] **ISSUES #18** — CSS never applied to the page. `TabManager` called
      `scripting.insertCSS`/`removeCSS` with an invalid payload (`codes: [code]`, `tabId` at the
      top level) instead of `{ target: { tabId }, css }`; every call threw and was swallowed.
      Rewrote `tab-manager.ts` (dual-mode tracking: scripting API vs programmatic `<style>`
      element), rewrote `injector.ts` (honors `isolated`/`recursive`/`atStart`; companion
      `<id>:css` user scripts for programmatic CSS; exclusion patterns kept), and reworked the
      background orchestration (differential registration + fingerprinting, registration moved
      inside `storage.onLoaded`, `applyRuleCss` routing, SPA-aware `page:open`/`page:update`
      handling, fallback JS gate fix via `isPersistentlyRegistered`).

- [x] **ISSUES #7/#8** — no changes detected when editing a rule (fixed: removed falsy-content guards in
      `isRuleUnsaved`/`isModuleUnsaved`, and `ruleUnsaved`/`moduleUnsaved` are now getters instead of
      computed refs so they recompute when the active draft is switched)
- [x] **Stale compiled code persisted** — `useThrottleFn(fn, 500)` (default `trailing=false, leading=true`)
      only saved the first mutation in each 500ms window, so the compiled output update (which happens after
      the async compile) was dropped and the leading save even deleted the old `f:<id>:c` key. Fixed in
      `src/lib/storage/base.ts`: the save watcher now uses `useDebounceFn(fn, 500)` so the final
      content + compiled state is persisted together.
- [x] **ISSUES #15** — duplicate rule on save without name. `saveRuleDraft`/`saveModuleDraft` now flip
      `isNew` synchronously (before the async compile) and guard the `push`; `State.switchDraft` no longer
      re-arms the once-watcher when switching to the already-active draft.
- [x] **ISSUES #16** — all scripts re-registered on every save. Cross-context storage merges keep local
      `info.emitter/created/updated` (only `info.theme` merges), and the background re-registration is now
      differential (fingerprint-based) and gated on the `rules` key changing; unchanged CSS is not
      re-injected.
- [x] **Draft round-trip** — `clean()` now writes `itemId`/`itemType` (and removes the inline `item`) so
      `parse()` can re-link drafts after a reload or cross-context merge; `parse()` falls back to the
      embedded item for data written by older builds.
- [x] **ISSUES #10** — import from the old v3.1.2 extension. `UJC_RESTORE_ORIGINAL_KEY=1` build option
      restores the original extension ID (see `config/buildManifest.ts`); the Settings → Storage screen has
      an "Import from old extension" button backed by `src/lib/storage/migrate.ts`.
- [x] **ISSUES #9** — URL match popup. `UrlMatchPopup.vue` (Header folder) opens on hover/click of the
      pattern group in `RuleHeader.vue` (reka-ui `Popover` + `PopoverAnchor`, settle delay for hover
      transitions). Simple/Advanced tabs build the pattern; shared list shows positive matches and negative
      exclusions with validity icons/tooltips, regex preview and remove. Writes back to the rule `patterns`
      string.
- [x] **ISSUES #21** — injection attempts into unsupported pages (`chrome-extension://`,
      `chrome://`, Web Store...). `filterRulesByUrl` matched restricted URLs (empty patterns match
      everything, inverted patterns match anything failing their regex), then the CSS paths and
      fallback JS injection threw permission errors on every navigation. Fixed with an
      `isInjectableUrl()` allowlist (http/https minus Chrome Web Store hosts) gating
      `filterRulesByUrl` — covers background triggers, badge count and popup listing.
- [x] **ISSUES #19** — infinite save loop in settings page (root cause: `saveRuleDraft`
      stamped `rule.updated = Date.now()` on the same object the draft watcher watched, so each
      save re-triggered itself. Fixed: `isUpdating` guard on `watchForSave`, and `saveRuleDraft`
      only stamps `updated` on an actual content change)
- [x] **ISSUES #20** — new rule not saved when typing pattern (root cause: `isRuleUnsaved`
      ignored `patterns`, so `cleanDrafts()` discarded a new rule that only had a typed URL
      pattern. Fixed: new rules with a non-empty `patterns` string now count as unsaved)
- [ ] **MonacoEditor.vue:37** — theme hardcoded to `'vs-dark'` (`TODO à changer`)
- [x] **compiler/typescript.ts** — `format()` bug fixed (now correctly called with `output`)
- [x] **ActionsBar.vue** — preview compilation wired (compiles the current editor content and
      opens `PreviewDialog`); Beautify formats the editor model so it works for **rule and module
      files** alike
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

- [x] `package.json` name/description from "wxt-vue-starter" to "user-javascript-and-css"
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
- [x] Module toasts — toast on module **created / updated / removed** (Save button +
      `ModuleMoreMenu.vue`; see section 7)
