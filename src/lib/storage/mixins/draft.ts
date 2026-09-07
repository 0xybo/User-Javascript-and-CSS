// import { compileSCSS } from '@/lib/compiler/scss';
import { compileSCSS } from '@/lib/compiler/scss';
import { compileTS } from '@/lib/compiler/typescript';
import {
    detectFileType,
    fetchFile,
    importFileName,
    resolveSource,
    type ImportMode,
} from '@/lib/module-import';
import { Logger } from '../../logger';
import { type Constructor } from '../../utils';
import { zFile } from '../schema';
import { FileType, IDraft, IItem, IRule, ItemType, type IFile, type IModule } from '../types';
import { DEFAULTS, isModule, isRule } from '../utils';
import type { StorageServiceSync } from './sync';

/**
 * Mixin that adds draft-related functionality to the storage service, including methods for
 * creating, saving, discarding, and retrieving drafts.
 *
 * @param Base - The base class to extend with draft-related functionality.
 * @returns A new class that extends the base class with draft-related methods.
 */
export function StorageServiceDraftsMixin<T extends StorageServiceSync>(Base: T) {
    class _StorageServiceDrafts extends Base {
        /**
         * Creates a new draft based on an existing item.
         *
         * @param item The item to create a draft from.
         * @returns The created draft.
         */
        createDraftFromItem<TItem extends IItem>(item: TItem): IDraft<TItem> {
            const draft = DEFAULTS.DRAFT<TItem>();
            if (isModule(item)) {
                const module = item;
                Object.assign(draft, {
                    isNew: false,
                    item: module,
                    files: Object.fromEntries(
                        module.files.filter((f) => !f.src).map((f) => [f.id, f.content]),
                    ),
                });
            } else {
                const rule = item as IRule;
                Object.assign(draft, {
                    isNew: false,
                    item: rule,
                    files: {
                        [rule.script.id]: rule.script.content,
                        [rule.style.id]: rule.style.content,
                    },
                });
            }

            return draft;
        }

        /**
         * Creates a new draft based on the specified item type.
         *
         * @param type The type of item to create a draft for (Rule or Module).
         * @returns The created draft.
         */
        createDraftFromType<TType extends ItemType>(type: TType): IDraft<TType> {
            const draft = DEFAULTS.DRAFT<TType>();
            if (isRule(type)) {
                const rule = draft.item as IRule;
                draft.files = {
                    [rule.script.id]: rule.script.content,
                    [rule.style.id]: rule.style.content,
                };
            } else {
                draft.item = DEFAULTS.MODULE();
            }

            return draft;
        }

        /**
         * Discards the specified draft, removing it from the list of drafts.
         *
         * @param draft The draft to discard.
         */
        discardDraft(draft: IDraft) {
            const index = this.drafts.findIndex((d) => d.item.id === draft.item.id);
            if (index !== -1) this.drafts.splice(index, 1);
        }

        /**
         * Compiles the files of the modules referenced by a rule into JS and CSS strings that are
         * prepended to the rule's own compiled output. JavaScript/TypeScript files are transpiled
         * with `compileTS`, CSS/SCSS files with `compileSCSS`. A file that fails to compile is
         * skipped so a broken dependency cannot break the whole rule.
         *
         * @param rule The rule whose referenced modules must be compiled.
         * @returns The joined transpiled module script and compiled module style.
         */
        private async compileModules(rule: IRule): Promise<{ script: string; style: string }> {
            const modules = (rule.modules || [])
                .map((id) => this.modules.find((m) => m.id === id))
                .filter((m): m is IModule => Boolean(m));

            const parts: { script: string[]; style: string[] } = { script: [], style: [] };
            for (const module of modules) {
                for (const file of module.files || []) {
                    if (!file.content) continue;
                    try {
                        if (
                            file.type === FileType.Typescript ||
                            file.type === FileType.Javascript
                        ) {
                            parts.script.push((await compileTS(file.content, {})).output);
                        } else if (file.type === FileType.Scss || file.type === FileType.Css) {
                            parts.style.push(
                                (
                                    await compileSCSS(file.content, {
                                        important: rule.style.important,
                                    })
                                ).output,
                            );
                        }
                    } catch (e) {
                        Logger.error('Module compilation failed:', module.name, file.name, e);
                    }
                }
            }
            return { script: parts.script.join('\n\n'), style: parts.style.join('\n\n') };
        }

        /**
         * Compiles the given script and style sources for a rule, prepending the compiled output of
         * the modules referenced by the rule (`rule.modules` order, file order within each module),
         * and stores the result on the rule's `script.compiled` / `style.compiled`.
         *
         * @param rule The rule to compile onto.
         * @param scriptContent The rule's own script source.
         * @param styleContent The rule's own style source.
         */
        private async compileRuleContent(rule: IRule, scriptContent: string, styleContent: string) {
            const moduleCompiled = await this.compileModules(rule);

            if (scriptContent) {
                try {
                    const result = await compileTS(scriptContent, {});
                    rule.script.compiled = [moduleCompiled.script, result.output]
                        .filter(Boolean)
                        .join('\n\n');
                } catch (e) {
                    Logger.error('TS compilation failed:', e);
                    rule.script.compiled = [moduleCompiled.script, scriptContent]
                        .filter(Boolean)
                        .join('\n\n');
                }
            } else rule.script.compiled = moduleCompiled.script;

            if (styleContent) {
                try {
                    const result = await compileSCSS(styleContent, {
                        important: rule.style.important,
                    });
                    rule.style.compiled = [moduleCompiled.style, result.output]
                        .filter(Boolean)
                        .join('\n\n');
                } catch (e) {
                    Logger.error('SCSS compilation failed:', e);
                    rule.style.compiled = [moduleCompiled.style, styleContent]
                        .filter(Boolean)
                        .join('\n\n');
                }
            } else rule.style.compiled = moduleCompiled.style;
        }

        /**
         * Saves the specified draft, updating the corresponding item in the storage and compiling
         * any necessary files.
         *
         * @param draft The draft to save.
         */
        async saveRuleDraft(draft: IDraft<IRule>) {
            const rule = draft.item;
            if (draft.isNew) {
                if (!this.rules.some((r) => r.id === rule.id)) this.rules.push(rule);
                draft.isNew = false;
            }

            const scriptContent = draft.files[rule.script.id];
            const styleContent = draft.files[rule.style.id];

            const contentChanged =
                rule.script.content !== scriptContent || rule.style.content !== styleContent;

            rule.script.content = scriptContent;
            rule.style.content = styleContent;

            await this.compileRuleContent(rule, scriptContent, styleContent);

            // Only stamp the updated timestamp when the rule actually changed. Stamping it on every
            // save would mutate the very object being watched by the draft watcher (draft.item is
            // the same reference as the stored rule), re-triggering a save → an endless save loop.
            if (contentChanged && !this.isUpdating) rule.updated = Date.now();
        }

        /**
         * Adds a new file of the given type to a module draft. The file is pushed onto the
         * module's `files` array and its (empty) content buffer is initialised in the draft's
         * `files` record so it can be edited immediately.
         *
         * @param draft The module draft to add the file to.
         * @param type The type of file to add (JavaScript or CSS).
         * @returns The id of the newly created file, or null if the draft is not a module.
         */
        addModuleFile(draft: IDraft<IModule>, type: FileType): string | null {
            const module = draft.item as IModule;
            if (!module.files) return null;
            const file = zFile.parse({ type });
            module.files.push(file);
            if (!draft.files) draft.files = {};
            draft.files[file.id] = file.content;
            return file.id;
        }

        /**
         * Removes a file from a module draft by its id, together with its content buffer.
         *
         * @param draft The module draft to remove the file from.
         * @param fileId The id of the file to remove.
         */
        removeModuleFile(draft: IDraft<IModule>, fileId: string) {
            const module = draft.item as IModule;
            const index = (module.files || []).findIndex((f) => f.id === fileId);
            if (index >= 0) module.files.splice(index, 1);
            if (draft.files) delete draft.files[fileId];
        }

        /**
         * Imports a file into a module draft from a URL or an npm module name. The source is
         * resolved (bare module names are fetched from the jsDelivr CDN), its type is detected
         * from the file extension / content type, and the fetched content is stored as a new
         * remote file (`src` set) on the module.
         *
         * @param draft The module draft to import the file into.
         * @param source The URL or npm module name to import.
         * @param mode How the source is interpreted ('auto' detects URL vs package).
         * @returns The newly created file.
         * @throws If the source cannot be fetched.
         */
        async importModuleFile(
            draft: IDraft<IModule>,
            source: string,
            mode: ImportMode = 'auto',
        ): Promise<IFile> {
            const module = draft.item as IModule;
            const url = resolveSource(source, mode);
            const fetched = await fetchFile(url);
            const type = detectFileType(fetched.url, fetched.contentType);
            const file = zFile.parse({
                type,
                name: importFileName(fetched.url, source, type),
                src: url,
                content: fetched.text,
            });
            (module.files || (module.files = [])).push(file);
            return file;
        }

        /**
         * Re-fetches the content of a remote file (`src` set) of a module draft from its source
         * URL and updates it in place.
         *
         * @param draft The module draft containing the file.
         * @param fileId The id of the remote file to refresh.
         * @returns The refreshed file.
         * @throws If the file has no source URL or cannot be fetched.
         */
        async refreshModuleFile(draft: IDraft<IModule>, fileId: string): Promise<IFile> {
            const module = draft.item as IModule;
            const file = (module.files || []).find((f) => f.id === fileId);
            if (!file) throw new Error('File not found');
            if (!file.src) throw new Error('File is not remote');
            const fetched = await fetchFile(file.src);
            file.content = fetched.text;
            await this.recompileRulesUsingModule(module.id);
            return file;
        }

        /**
         * Saves the specified draft, updating the corresponding item in the storage and compiling
         * any necessary files.
         *
         * @param draft The draft to save.
         */
        async saveModuleDraft(draft: IDraft<IModule>) {
            if (draft.isNew) {
                if (!this.modules.some((m) => m.id === draft.item.id))
                    this.modules.push(draft.item);
                draft.isNew = false;
            }

            const module = draft.item;
            module.files.forEach((f) => {
                if (!f.src) f.content = draft.files[f.id] || '';
            });

            // Rules referencing this module embed its compiled files, so recompile them to reflect
            // the current content. This mutates `this.rules`, which the throttled storage save
            // persists and the background uses to re-register the affected user scripts.
            await this.recompileRulesUsingModule(module.id);
        }

        /**
         * Recompiles a stored rule in place from its own saved content, including the compiled
         * output of the modules it references.
         *
         * @param rule The stored rule to recompile.
         */
        async recompileRule(rule: IRule) {
            await this.compileRuleContent(rule, rule.script.content, rule.style.content);
        }

        /**
         * Recompiles every stored rule that references the given module, so that edits to the
         * module's files are reflected in the compiled output of the rules using it.
         *
         * @param module The module id, or the module itself, whose dependent rules must be
         * recompiled.
         */
        async recompileRulesUsingModule(module: string | IModule) {
            const id = typeof module === 'string' ? module : module.id;
            for (const rule of this.rules.filter((r) => (r.modules || []).includes(id)))
                await this.recompileRule(rule);
        }

        /**
         * Saves the specified draft, updating the corresponding item in the storage and compiling
         * any necessary files.
         *
         * @param draft The draft to save.
         */
        async saveDraft(draft: IDraft) {
            if (isRule(draft)) this.saveRuleDraft(draft);
            else if (isModule(draft)) this.saveModuleDraft(draft);
        }

        /**
         * Retrieves a draft corresponding to the specified item, if it exists.
         *
         * @param item The item for which to retrieve the draft.
         * @returns The corresponding draft, or null if no draft exists for the item.
         */
        getDraftFromItem<TItem extends IItem>(item: TItem): IDraft<TItem> | null {
            return (this.drafts.find((d) => d.item.id === item.id) as IDraft<TItem>) ?? null;
        }

        /**
         * Retrieves a new draft corresponding to the specified item type, if it exists.
         *
         * @param type The item type for which to retrieve the new draft.
         * @returns The corresponding new draft, or null if no new draft exists for the item type.
         */
        getDraftNewFromType<TType extends ItemType>(type: TType): IDraft<TType> | null {
            return (
                (this.drafts.find((d) => d.isNew && d.item.type === type) as IDraft<TType>) ?? null
            );
        }

        /**
         * Retrieves a draft corresponding to the specified item ID, if it exists.
         *
         * @param id The ID of the item for which to retrieve the draft.
         * @returns The corresponding draft, or null if no draft exists for the item ID.
         */
        getDraftFromId(id: string): IDraft | null {
            return this.drafts.find((d) => d.item.id === id) ?? null;
        }

        /**
         * Clears all drafts from the storage.
         */
        clearDrafts() {
            this.drafts.splice(0);
        }

        /**
         * Removes the specified draft from the storage.
         *
         * @param draft The draft to remove.
         */
        removeDraft(draft: IDraft) {
            const index = this.drafts.findIndex((d) => d.item.id === draft.item.id);
            if (index !== -1) this.drafts.splice(index, 1);
        }
    }

    return _StorageServiceDrafts as Constructor<_StorageServiceDrafts>;
}

/**
 * Type representing the storage service with draft-related functionality, including methods for
 * creating, saving, discarding, and retrieving drafts.
 */
export type StorageServiceDrafts = ReturnType<typeof StorageServiceDraftsMixin>;
