import { reactive } from '#imports';
// import { compileSCSS } from '@/lib/compiler/scss';
import { compileSCSS } from '@/lib/compiler/scss';
import { compileTS } from '@/lib/compiler/typescript';
import { Logger } from '../../logger';
import { clone, type Constructor } from '../../utils';
import type { StorageServiceBase } from '../base';
import { IDraft, IItem, IRule, ItemType } from '../types';
import { DEFAULTS, isModule, isRule } from '../utils';

/**
 * Mixin that adds draft-related functionality to the storage service, including methods for
 * creating, saving, discarding, and retrieving drafts.
 *
 * @param Base - The base class to extend with draft-related functionality.
 * @returns A new class that extends the base class with draft-related methods.
 */
export function StorageServiceDraftsMixin(Base: Constructor<StorageServiceBase>) {
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
                const module = clone(item);
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
            const reactiveDraft = reactive(draft);
            this.drafts.push(reactiveDraft);

            return reactiveDraft as IDraft<TItem>;
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
                draft.item = reactive(DEFAULTS.MODULE());
            }
            const reactiveDraft = reactive(draft);
            this.drafts.push(reactiveDraft);

            return reactiveDraft as IDraft<TType>;
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
         * Saves the specified draft, updating the corresponding item in the storage and compiling any necessary files.
         *
         * @param draft The draft to save.
         */
        async saveDraft(draft: IDraft) {
            if (isRule(draft)) {
                if (draft.isNew) this.rules.push(draft.item as IRule);
                const rule = draft.item;
                rule.script.content = draft.files[rule.script.id];
                rule.style.content = draft.files[rule.style.id];

                if (rule.script.content) {
                    try {
                        const result = await compileTS(rule.script.content, {});
                        rule.script.compiled = result.output;
                    } catch (e) {
                        Logger.error('TS compilation failed:', e);
                        rule.script.compiled = rule.script.content;
                    }
                } else rule.script.compiled = '';

                if (rule.style.content) {
                    try {
                        const result = await compileSCSS(rule.style.content, {
                            important: rule.style.important,
                        });
                        rule.style.compiled = result.output;
                    } catch (e) {
                        Logger.error('SCSS compilation failed:', e);
                        rule.style.compiled = rule.style.content;
                    }
                } else rule.style.compiled = '';

                rule.updated = Date.now();
            } else if (isModule(draft)) {
                if (draft.isNew) this.modules.push(draft.item);
                const module = draft.item;
                module.files.forEach((f) => (f.content = draft.files[f.id]));
            }
            draft.isNew = false;
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
