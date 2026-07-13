import { computed, MaybeRef, reactive, unref, watch } from '#imports';
import { Tab } from '@/lib/options';
import { Panel } from '@/lib/options/panel';
import { DraftT, ItemType } from '@/lib/storage/types';
import { isRule } from '@/lib/storage/utils';
import { hasChanged, useDraft } from '../useDraft';
import { useStorage } from '../useStorage';

const TYPES: Record<string, ItemType> = {
    r: ItemType.Rule,
    m: ItemType.Module,
};

const storage = useStorage();

class State {
    public tab: Tab | null = Tab.Rules;
    public rule: DraftT<ItemType.Rule> = useDraft(ItemType.Rule);
    public module: DraftT<ItemType.Module> = useDraft(ItemType.Module);
    public panel: Panel = Panel.Rule;
    public settingsSection: string | null = null;
    public ruleChanged = computed(() => hasChanged(this.rule));
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
}

const state = new State();

export function useState() {
    return state;
}
