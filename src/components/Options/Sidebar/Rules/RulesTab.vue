<script setup lang="ts">
import { computed, ref } from '#imports';
import RuleList from '@/components/RuleList.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useDialog } from '@/composables/options/useDialog';
import { useState } from '@/composables/options/useState';
import { useDraft } from '@/composables/useDraft';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation.ts';
import { useSort } from '@/lib/options/sortRules';
import { IRule, ItemType } from '@/lib/storage/types';
import { BookPlus } from 'lucide-vue-next';
import SortSelect from './SortSelect.vue';

const t = useTranslation();
const sort = useSort();
const state = useState();
const storage = useStorage();
const dialog = useDialog();
const searchQuery = ref<string>('');
const rules = computed(() => {
    return Array.from(storage.rules)
        .filter((rule) => {
            if (!searchQuery.value) return true;

            const name = rule.name?.toLowerCase();
            const patterns = rule.patterns.toLowerCase();
            const query = searchQuery.value.toLowerCase();

            return (name ? name.includes(query) : true) || patterns.includes(query);
        })
        .sort(sort[storage.settings.sortBy].method);
});

/**
 * Handles the click event for creating a new rule. If a draft for a new rule already exists, it
 * prompts the user to either open the existing draft or discard it and create a new one.
 */
function onNewRuleButtonClick() {
    const draft = storage.getDraftNewFromType(ItemType.Rule);
    if (draft) {
        dialog.open({
            title: t('DIALOG.CONFIRM.CONFIRM'),
            message: t('DRAFT.ALREADY_EXISTS'),
            actions: [
                { label: t('DIALOG.CONFIRM.CANCEL'), callback: () => {} },
                { label: t('DRAFT.OPEN_EXISTING'), callback: () => state.switchDraft(draft) },
                {
                    label: t('DIALOG.CONFIRM.CONFIRM'),
                    callback: () => {
                        storage.discardDraft(draft);
                        state.switchDraft(storage.createDraftFromType(ItemType.Rule));
                    },
                },
            ],
        });
    } else state.switchDraft(storage.createDraftFromType(ItemType.Rule));
}

/**
 * Handles the event when a rule is opened from the rule list. It switches the current draft to the
 * selected rule.
 *
 * @param rule The rule that was opened from the rule list.
 */
function onRuleListOpen(rule: IRule) {
    state.switchDraft(useDraft(rule));
}
</script>

<template>
    <div class="flex h-full flex-col overflow-y-auto">
        <div>
            <div class="flex min-h-8 flex-row justify-between px-4 py-2 text-xs select-none">
                <div class="flex items-center tracking-widest uppercase">
                    {{ t('COMMON.RULES') }} ({{ rules.length }})
                </div>
                <Button
                    class="text-foreground flex h-min flex-row gap-1 p-0"
                    variant="link"
                    @click="onNewRuleButtonClick"
                >
                    <BookPlus :size="16" />
                    {{ t('COMMON.NEW_RULES') }}
                </Button>
            </div>
            <div class="flex flex-row gap-2 border-b px-4 py-3">
                <Input
                    type="text"
                    :placeholder="t('COMMON.FIND')"
                    class="border-secondary"
                    v-model="searchQuery"
                />
                <SortSelect />
            </div>
        </div>
        <div class="flex flex-1 flex-col overflow-y-auto">
            <RuleList :rules="rules" @open="onRuleListOpen" :opened-rule-id="state.rule.item.id" />
        </div>
    </div>
</template>

<style lang="css" scoped></style>
