<script setup lang="ts">
import { computed, i18n } from '#imports';
import RuleList from '@/components/RuleList.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useDialog } from '@/composables/options/useDialog';
import { useState } from '@/composables/options/useState';
import { useDraft } from '@/composables/useDraft';
import { useStorage } from '@/composables/useStorage';
import { SORT } from '@/lib/options/sortRules';
import { ItemType, RuleT } from '@/lib/storage/types';
import { BookPlus } from 'lucide-vue-next';
import SortSelect from './Rules/SortSelect.vue';

const state = useState();
const storage = useStorage();
const dialog = useDialog();
const rules = computed(() => {
    return Array.from(storage.rules).sort(SORT[storage.settings.sortBy].method);
});

function onNewRuleButtonClick() {
    const draft = storage.getDraftNewFromType(ItemType.Rule);
    if (draft) {
        dialog.open({
            title: i18n.t('DIALOG_CONFIRM_CONFIRM'),
            message: i18n.t('DRAFT_ALREADY_EXISTS'),
            actions: [
                { label: i18n.t('DIALOG_CONFIRM_CANCEL'), callback: () => {} },
                { label: i18n.t('DRAFT_OPEN_EXISTING'), callback: () => state.switchDraft(draft) },
                {
                    label: i18n.t('DIALOG_CONFIRM_CONFIRM'),
                    callback: () => {
                        storage.discardDraft(draft);
                        state.switchDraft(storage.createDraftFromType(ItemType.Rule));
                    },
                },
            ],
        });
    } else state.switchDraft(storage.createDraftFromType(ItemType.Rule));
}

function onRuleListOpen(rule: RuleT) {
    state.switchDraft(useDraft(rule));
}
</script>

<template>
    <div class="flex flex-col">
        <div class="flex min-h-8 flex-row justify-between px-4 py-2 text-xs select-none">
            <div class="flex items-center tracking-widest uppercase">
                {{ i18n.t('COMMON_RULES') }} ({{ rules.length }})
            </div>
            <Button
                class="text-foreground flex h-min flex-row gap-1 p-0"
                variant="link"
                @click="onNewRuleButtonClick"
            >
                <BookPlus :size="16" />
                {{ i18n.t('COMMON_NEW_RULES') }}
            </Button>
        </div>
        <div class="flex flex-row gap-2 border-b px-4 py-3">
            <Input type="text" :placeholder="i18n.t('COMMON_FIND')" class="border-secondary" />
            <SortSelect />
        </div>
        <div class="flex flex-1 flex-col">
            <RuleList :rules="rules" @open="onRuleListOpen" :opened-rule-id="state.rule.item.id" />
        </div>
    </div>
</template>

<style lang="css" scoped></style>
