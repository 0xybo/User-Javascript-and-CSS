# AGENTS.md

Browser extension "User Javascript and CSS" — WXT + Vue 3 + TS + Tailwind v4, rebuilt from the
original v3.1.2 extension. Work-in-progress rebuild tracked in `TODO.md` and `ISSUES.md` (read
`TODO.md` before implementing features and don't forget to update `TODO.md` after implementing
them).

## Toolchain

- **Bun** is the package manager (`bun.lock`). Use `bun install` / `bun run ...`, not npm/yarn.
- `postinstall` runs `wxt prepare`, generating `.wxt/` (gitignored). `tsconfig.json` extends
  `.wxt/tsconfig.json`, which types the `#imports` auto-imports (e.g. `browser`, `ref`,
  `computed`) and the `@/` → `src/` alias.
- No test suite exists. No lint script is wired up; ESLint (flat config in `eslint.config.ts`)
  runs via `bunx eslint .`.

## Commands

| Task                 | Command                                     |
| -------------------- | ------------------------------------------- |
| Dev server (Chrome)  | `bun run dev`                               |
| Dev server (Firefox) | `bun run dev:firefox`                       |
| Build                | `bun run build` / `bun run build:firefox`   |
| Package              | `bun run zip` / `bun run zip:firefox`       |
| Typecheck            | `bun run compile` (runs `vue-tsc --noEmit`) |

**`bun run compile` is currently red at HEAD on `dev`** — pre-existing errors in
`src/entrypoints/content/index.ts` (unknown `navigation` API) and
`src/lib/background/tab-manager.ts` (`tabId` on `CSSInjection`). When verifying your work,
compare against this baseline; don't assume you introduced every error.

## Branching

Work on `dev`. `master` is a single initial commit (origin/HEAD points to it). Never commit to
`master`.

Never commit directly.

## State architecture

There is **no Pinia** despite README/TODO mentioning it — state is a single `StorageService`
singleton in `src/lib/storage/index.ts` (`export const storage`):

- Vue `reactive` state (`info`, `settings`, `rules`, `modules`, `drafts`) + zod schemas
  (`src/lib/storage/schema.ts`, `jitless: true` because MV3 forbids eval).
- Cross-tab/window sync via `browser.storage.local` `onChanged` listener with EMITTER dedup and
  throttled saves (500ms). Don't create separate stores; add methods via the mixins in
  `src/lib/storage/mixins/` (base → sync → drafts → item).
- UI reads state through composables in `src/composables/` (`useStorage`, `useRules`,
  `useSettings`, etc.).

Storage layout quirk: rule/module file _content_ lives in `f:<id>` (+ `f:<id>:c` for compiled
script/CSS), draft items in `d:<id>`; the item records themselves store only IDs (see
`RuleStored`/`ModuleStored`/`DraftStored` in `src/lib/storage/types.ts`). JSON export must
reconstruct/clean this.

## i18n

Typed vue-i18n. `src/locales/_schema/index.d.ts` is the source of truth for the message shape;
every new key must be added there **and** to `src/locales/en-US/index.ts` **and**
`src/locales/fr-FR/index.ts` (both `as const satisfies Messages`). Locale files use ALL_CAPS
nested key naming.

## Compilation & editors

- Scripts are TypeScript, compiled with `transpileModule` on save; styles are SCSS, compiled with
  sass.js via a worker (`config/withSass.ts` copies `node_modules/sass.js/dist/sass.worker.js`
  into the build output). If that file is missing you get "SCSS compilation is not available in
  development mode."
- Monaco is bundled by a custom vite plugin (`config/withMonaco/`); features/languages/fonts are
  tree-shaken in `config/withMonaco/resolvers/`. Add languages/features there, not in components.
- `webExt.disabled: true` — `wxt dev` does not auto-launch a browser; load `dist/` unpacked
  manually. `vite-plugin-vue-devtools` is appended to the options entrypoint.

## Misc

- Manifest differs by browser in `config/buildManifest.ts`: Chrome gets `userScripts` in
  `permissions`, Firefox gets it in `optional_permissions`.
- `resources/` (gitignored) holds the original extension source
  (`resources/original_extension/3.1.2_0`) as a reference. Don't commit there.
- Code style: 4-space indent, single quotes, `printWidth: 100`, `prettier-plugin-tailwindcss`.
  `vue/multi-word-component-names` is disabled under `src/components/ui/`.
