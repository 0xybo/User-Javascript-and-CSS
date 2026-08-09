<script setup lang="ts">
import { i18n } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import InputGroup from '@/components/ui/input-group/InputGroup.vue';
import InputGroupAddon from '@/components/ui/input-group/InputGroupAddon.vue';
import InputGroupInput from '@/components/ui/input-group/InputGroupInput.vue';
import Label from '@/components/ui/label/Label.vue';
import { useState } from '@/composables/options/useState';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast';
import { IRule, ItemType } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind';
import { BadgeCheckIcon, SaveIcon } from 'lucide-vue-next';
import ModulesMenu from './Header/ModulesMenu.vue';
import MoreMenu from './Header/MoreMenu.vue';

const state = useState();
const storage = useStorage();
const { push } = useToast();

/**
 * Handles the click event on the save button. Saves the current rule draft and displays a toast
 * notification indicating whether the rule was created or updated.
 */
function onSaveButtonClick() {
    const wasNew = state.rule.isNew;
    state.saveRuleDraft();
    push({
        title: i18n.t(wasNew ? 'TOAST_RULE_CREATED' : 'TOAST_RULE_UPDATED'),
        variant: 'success',
    });
}
</script>

<template>
    <div class="flex w-full flex-row gap-1 border-b p-1">
        <InputGroup class="border-primary h-min flex-1">
            <InputGroupAddon class="absolute top-0 pt-1! pb-0 pl-2">
                <Label class="text-muted p-0 text-xs">
                    {{ i18n.t('EDITOR_RULE_NAME') }}
                </Label>
            </InputGroupAddon>
            <InputGroupInput
                :placeholder="i18n.t('EDITOR_RULE_NAME_EXAMPLE')"
                class="h-11 pt-6 pb-2!"
                v-model="state.rule.item.name"
            />
        </InputGroup>
        <InputGroup
            class="border-primary h-min flex-2"
            v-if="state.rule.item.type === ItemType.Rule"
        >
            <InputGroupAddon>
                <BadgeCheckIcon :size="24" class="text-success/75 size-6" :stroke-width="1.5" />
            </InputGroupAddon>
            <div class="relative w-full">
                <InputGroupAddon class="absolute top-0 left-0 pt-1! pb-0">
                    <Label class="text-muted p-0 text-xs">
                        {{ i18n.t('EDITOR_URL_PATTERN') }}
                    </Label>
                </InputGroupAddon>
                <InputGroupInput
                    :placeholder="i18n.t('EDITOR_URL_PATTERN_EXAMPLE')"
                    class="h-11 pt-6 pb-2! pl-3!"
                    v-model="(state.rule.item as IRule).patterns"
                />
            </div>
        </InputGroup>
        <ModulesMenu />
        <Button
            @click="onSaveButtonClick"
            :disabled="!state.ruleUnsaved"
            variant="ghost"
            :class="
                cn('bg-accent text-accent-foreground h-full', {
                    'bg-primary text-primary-foreground': !state.ruleUnsaved,
                })
            "
        >
            <SaveIcon class="size-5" />
            {{ i18n.t('COMMON_SAVE') }}
        </Button>
        <MoreMenu />
    </div>
</template>

<style lang="css" scoped></style>
