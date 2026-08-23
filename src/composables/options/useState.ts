import { reactive, watch } from '#imports';
import { SettingsSection } from '@/lib/options/settings';
import { Panel, Tab, TAB_TO_PANEL_MAP } from '@/lib/options/tab';
import { IDraft, ItemType } from '@/lib/storage/types';
import { isModuleUnsaved, isRule, isRuleUnsaved, isUnsaved } from '@/lib/storage/utils';
import { has } from '@/lib/utils';
import { useThrottleFn } from '@vueuse/core';
import type { Reactive } from 'vue';
import { useDraft } from '../useDraft';
import { useStorage } from '../useStorage';

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
    public rule: IDraft<ItemType.Rule> = useDraft(ItemType.Rule);
    /** The current module draft */
    public module: IDraft<ItemType.Module> = useDraft(ItemType.Module);
    /** The current settings section */
    public settingsSection: SettingsSection | null = null;
    /** Getter that indicates whether the current rule draft has changed. Evaluated against the
     * reactive proxy, so it recomputes whenever the current draft is switched. */
    public get ruleUnsaved(): boolean {
        return isRuleUnsaved(this.rule);
    }
    /** Getter that indicates whether the current module draft has changed. Evaluated against the
     * reactive proxy, so it recomputes whenever the current draft is switched. */
    public get moduleUnsaved(): boolean {
        return isModuleUnsaved(this.module);
    }

    private ruleDraftWatcher: ReturnType<typeof watch> | null = null;
    private moduleDraftWatcher: ReturnType<typeof watch> | null = null;
    /**
     * The reactive proxy of the State instance. This is used to ensure that matutations to the
     * state are reactive and trigger updates in Vue components.
     */
    private reactive: State;

    constructor() {
        storage.onLoaded(() => this.initialize());

        return (this.reactive = reactive(this) as unknown as State);
    }

    private initialize() {
        this.goToHashLocation();

        this.watchOnceForSave(this.reactive.rule);
        this.watchOnceForSave(this.reactive.module);
    }

    /**
     * Watches the provided draft for changes and saves it to storage when it changes.
     * It also updates the location hash to reflect the current draft.
     *
     * @param draft The draft to watch for changes.
     */
    private watchOnceForSave(draft: Reactive<IDraft>) {
        watch(
            draft.item,
            () => {
                storage.saveDraft(draft);
                this.watchForSave(draft);
            },
            { once: true },
        );
    }

    /**
     * Watches the provided draft for changes and saves it to storage when it changes.
     *
     * @param draft The draft to watch for changes.
     * @returns A function that can be called to stop watching the draft.
     */
    private watchForSave(draft: Reactive<IDraft>) {
        const watchHandler = watch(
            draft.item,
            useThrottleFn(() => storage.saveDraft(draft), 500),
        );

        if (isRule(draft)) {
            if (this.ruleDraftWatcher) this.ruleDraftWatcher();
            return (this.ruleDraftWatcher = watchHandler);
        }

        if (this.moduleDraftWatcher) this.moduleDraftWatcher();
        return (this.moduleDraftWatcher = watchHandler);
    }

    /**
     * Switches the current draft to the provided draft.
     * If the draft is a rule, it will switch to the rule tab and panel.
     * If the draft is a module, it will switch to the module tab and panel.
     * It also removes the old draft from storage if it has changed.
     *
     * @param draft The draft to switch to.
     */
    public switchDraft(draft: Reactive<IDraft>) {
        if (isRule(draft)) {
            const isSameDraft = draft.item.id === this.rule.item.id;
            this.reactive.rule = draft;

            if (!isSameDraft) {
                if (draft.isNew) this.watchOnceForSave(this.reactive.rule);
                else this.watchForSave(this.reactive.rule);
            }

            this.switchTab(Tab.Rules);
        } else {
            const isSameDraft = draft.item.id === this.module.item.id;
            this.reactive.module = draft as Reactive<IDraft<ItemType.Module>>;

            if (!isSameDraft) {
                if (draft.isNew) this.watchOnceForSave(this.reactive.module);
                else this.watchForSave(this.reactive.module);
            }

            this.switchTab(Tab.Modules);
        }

        this.cleanDrafts();
        this.updateHash();
    }

    /**
     * Cleans up the drafts in storage by removing any drafts that have not been saved. It checks
     * each draft in storage and removes it if it has no unsaved changes.
     */
    public cleanDrafts() {
        storage.drafts.forEach((draft) => {
            if (!isUnsaved(draft) && this.reactive.rule.item.id !== draft.item.id)
                storage.removeDraft(draft);
        });
    }

    /**
     * Switches the current draft to a new draft of the specified type.
     * It creates a new draft from the specified type and switches to it.
     *
     * @param type The type of the new draft to switch to.
     */
    public switchToNewDraft(type: ItemType) {
        const draft = storage.createDraftFromType(type);
        this.switchDraft(draft);
    }

    /**
     * Saves the current rule draft to storage. It uses the storage service to save the rule draft.
     * If the rule draft is new, it will be added to the storage. If it has been modified, the
     * changes will be saved to the corresponding rule in storage.
     */
    public saveRuleDraft() {
        storage.saveRuleDraft(this.reactive.rule);
    }

    /**
     * Saves the current module draft to storage. It uses the storage service to save the module draft.
     * If the module draft is new, it will be added to the storage. If it has been modified, the
     * changes will be saved to the corresponding module in storage.
     */
    public saveModuleDraft() {
        storage.saveModuleDraft(this.reactive.module);
    }

    /**
     * Switches the current tab to the provided tab.
     * If the tab has a corresponding panel, it will also switch to that panel.
     *
     * @param tab The tab to switch to.
     */
    public switchTab(tab: Tab | null) {
        this.reactive.tab = tab;

        if (tab && tab in TAB_TO_PANEL_MAP) this.reactive.panel = TAB_TO_PANEL_MAP[tab]!;

        this.updateHash();
    }

    /**
     * Switches the current settings section to the provided section.
     * If the section is null, it will switch to the default settings section.
     *
     * @param section The settings section to switch to.
     */
    public switchSettingsSection(section: SettingsSection | null) {
        this.reactive.settingsSection = section;
        this.switchTab(Tab.Settings);
    }

    /**
     * Updates the location hash to reflect the current state of the options page.
     * The hash format is as follows:
     * - For rules: #rule:<ruleId>
     * - For modules: #module:<moduleId>
     * - For settings: #settings[:<section>]
     * - For about: #about
     */
    private updateHash() {
        switch (this.reactive.tab) {
            case Tab.Rules:
                location.hash = 'rule:' + this.reactive.rule.item.id;
                break;
            case Tab.Modules:
                location.hash = 'module:' + this.reactive.module.item.id;
                break;
            case Tab.Settings:
                location.hash =
                    'settings' +
                    (this.reactive.settingsSection ? ':' + this.reactive.settingsSection : '');
                break;
            case Tab.About:
                break;
            default:
                location.hash = '';
        }
    }

    private goToHashLocation() {
        const [hash, detail] = location.hash.slice(1).split(':');
        switch (hash) {
            case 'rule':
                const ruleDraft = storage.getDraftFromId(detail);
                if (ruleDraft && isRule(ruleDraft)) {
                    this.switchDraft(ruleDraft);
                    break;
                }

                const rule = storage.getItemFromId(detail);
                if (rule && isRule(rule)) {
                    const newRuleDraft = storage.createDraftFromItem(rule);
                    this.switchDraft(newRuleDraft);
                    break;
                }

                const newRuleDraft = storage.createDraftFromType(ItemType.Rule);
                this.switchDraft(newRuleDraft);
                break;
            case 'module':
                const moduleDraft = storage.getDraftFromId(detail);
                if (moduleDraft && !isRule(moduleDraft)) {
                    this.switchDraft(moduleDraft);
                    break;
                }

                const module = storage.getItemFromId(detail);
                if (module && !isRule(module)) {
                    const newModuleDraft = storage.createDraftFromItem(module);
                    this.switchDraft(newModuleDraft);
                    break;
                }

                const newModuleDraft = storage.createDraftFromType(ItemType.Module);
                this.switchDraft(newModuleDraft);
                break;
            case 'settings':
                if (detail && has(SettingsSection, detail))
                    this.switchSettingsSection(detail as SettingsSection);
                else this.switchTab(Tab.Settings);
                break;
            case 'about':
                this.switchTab(Tab.About);
                break;
            default:
                this.switchTab(Tab.Rules);
        }
    }
}

const state = new State();

/**
 * Returns the current state of the options page. The state is reactive and can be used in Vue components.
 *
 * @returns The current state of the options page.
 */
export default function useState() {
    return state;
}
