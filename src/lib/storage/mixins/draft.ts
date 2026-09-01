// import { compileSCSS } from '@/lib/compiler/scss';
import { compileSCSS } from '@/lib/compiler/scss';
import { compileTS } from '@/lib/compiler/typescript';
import { Logger } from '../../logger';
import { type Constructor } from '../../utils';
import { IDraft, IItem, IRule, ItemType, type IModule } from '../types';
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

            if (scriptContent) {
                try {
                    const result = await compileTS(scriptContent, {});
                    rule.script.compiled = result.output;
                } catch (e) {
                    Logger.error('TS compilation failed:', e);
                    rule.script.compiled = rule.script.content;
                }
            } else rule.script.compiled = '';

            if (styleContent) {
                try {
                    const result = await compileSCSS(styleContent, {
                        important: rule.style.important,
                    });
                    rule.style.compiled = result.output;
                } catch (e) {
                    Logger.error('SCSS compilation failed:', e);
                    rule.style.compiled = rule.style.content;
                }
            } else rule.style.compiled = '';

            // Only stamp the updated timestamp when the rule actually changed. Stamping it on every
            // save would mutate the very object being watched by the draft watcher (draft.item is
            // the same reference as the stored rule), re-triggering a save → an endless save loop.
            if (contentChanged && !this.isUpdating) rule.updated = Date.now();
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
            module.files.forEach((f) => (f.content = draft.files[f.id] || ''));
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
