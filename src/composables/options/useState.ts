import { computed, MaybeRef, reactive, unref, watch } from '#imports';
import type { SettingsSection } from '@/lib/options/settings';
import { Panel, Tab, TAB_TO_PANEL_MAP } from '@/lib/options/tab';
import { DraftT, ItemType } from '@/lib/storage/types';
import { isRule } from '@/lib/storage/utils';
import { hasChanged, useDraft } from '../useDraft';
import { useStorage } from '../useStorage';

/** A mapping of type letters to item types */
const TYPES: Record<string, ItemType> = {
    r: ItemType.Rule,
    m: ItemType.Module,
};

const storage = useStorage();

/**
 * State class that manages the current state of the options page, including the current tab, panel, and drafts for rules and modules. It provides some methods to manipulate the state, such as switching drafts and tabs. The state is reactive and can be used in Vue components.
 */
class State {
    /** The current tab */
    public tab: Tab | null = Tab.Rules;
    /** The current panel */
    public panel: Panel = Panel.Rule;
    /** The current rule draft */
    public rule: DraftT<ItemType.Rule> = useDraft(ItemType.Rule);
    /** The current module draft */
    public module: DraftT<ItemType.Module> = useDraft(ItemType.Module);
    /** The current settings section */
    public settingsSection: SettingsSection | null = null;
    /** Computed property that indicates whether the current rule draft has changed */
    public ruleChanged = computed(() => hasChanged(this.rule));
    /** Computed property that indicates whether the current module draft has changed */
    public moduleChanged = computed(() => hasChanged(this.module));

    constructor() {
        watch(
            () => storage.loaded,
            () => {
                const [typeLetter, id] = location.hash.slice(1).split(':');
                if (typeLetter && id) {
                    const type = TYPES[typeLetter];
                    if (type) {
                        let draft = storage.getDraftFromId(id);
                        if (!draft) {
                            const item = storage.getItemFromId(id);
                            if (item) draft = storage.createDraftFromItem(item);
                            else draft = storage.createDraftFromType(type);
                        }

                        if (isRule(draft)) this.rule = draft;
                        else this.module = draft as DraftT<ItemType.Module>;
                    }
                }

                location.hash = '';
                return;
            },
            { once: true },
        );

        this.watchOnceForSave(this.rule);
        this.watchOnceForSave(this.module);

        return reactive(this) as unknown as State;
    }

    /**
     * Watches the provided draft for changes and saves it to storage when it changes.
     * It also updates the location hash to reflect the current draft.
     *
     * @param draft The draft to watch for changes.
     */
    private watchOnceForSave(draft: MaybeRef<DraftT>) {
        const noRefDraft = unref(draft);
        watch(
            noRefDraft.item,
            () => {
                storage.saveDraft(noRefDraft);
                location.hash = noRefDraft.item.type.at(0) + ':' + noRefDraft.item.id;
            },
            { once: true },
        );
    }

    /**
     * Switches the current draft to the provided draft.
     * If the draft is a rule, it will switch to the rule tab and panel.
     * If the draft is a module, it will switch to the module tab and panel.
     * It also removes the old draft from storage if it has changed.
     *
     * @param draft The draft to switch to.
     */
    public switchDraft(draft: DraftT) {
        let oldDraft: DraftT;
        if (isRule(draft)) {
            oldDraft = this.rule;
            this.rule = draft;
            this.watchOnceForSave(this.rule);
            this.tab = Tab.Rules;
        } else {
            oldDraft = this.module;
            this.module = draft as DraftT<ItemType.Module>;
            this.watchOnceForSave(this.module);
            this.tab = Tab.Modules;
        }

        if (!hasChanged(oldDraft)) storage.removeDraft(oldDraft);

        location.hash = draft.item.type.at(0) + ':' + draft.item.id;
    }

    /**
     * Switches the current tab to the provided tab.
     * If the tab has a corresponding panel, it will also switch to that panel.
     *
     * @param tab The tab to switch to.
     */
    public switchTab(tab: Tab | null) {
        this.tab = tab;

        if (tab && tab in TAB_TO_PANEL_MAP) this.panel = TAB_TO_PANEL_MAP[tab]!;
    }
}

const state = new State();

/**
 * Returns the current state of the options page. The state is reactive and can be used in Vue components.
 *
 * @returns The current state of the options page.
 */
export function useState() {
    return state;
}
