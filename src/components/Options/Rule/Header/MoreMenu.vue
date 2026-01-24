<script setup lang="ts">
import { i18n } from '#imports';
import TooltipWrapper from '@/components/TooltipWrapper.vue';
import Button from '@/components/ui/button/Button.vue';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import Label from '@/components/ui/label/Label.vue';
import Popover from '@/components/ui/popover/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { useState } from '@/composables/options/useState';
import { useDraft } from '@/composables/useDraft';
import { useStorage } from '@/composables/useStorage';
import { ItemType, RuleT } from '@/lib/storage/types';
import { EllipsisVerticalIcon, Trash2Icon, Undo2Icon } from 'lucide-vue-next';

const state = useState();
const storage = useStorage();

function onRemoveButtonClick() {
    storage.removeItem(state.rule.item);
    state.switchDraft(useDraft(ItemType.Rule));
}
function onRevertButtonClick() {
    const item = state.rule.item as RuleT;
    state.rule.files[item.script.id] = item.script.content;
    state.rule.files[item.style.id] = item.style.content;
}
function onCheckboxUpdated(value: boolean | 'indeterminate') {
    console.log('Updated', value);
    (state.rule.item as RuleT).enabled = value === true;
}
</script>

<template>
    <Popover>
        <PopoverTrigger as-child>
            <Button class="aspect-square h-full">
                <EllipsisVerticalIcon />
            </Button>
        </PopoverTrigger>
        <PopoverContent
            side="bottom"
            align="end"
            class="w-min min-w-(--reka-popover-trigger-width) px-0 py-2"
        >
            <Label
                class="group hover:bg-secondary text-foreground flex cursor-pointer flex-row items-center gap-2 px-4 py-2 font-normal"
            >
                <Checkbox
                    :default-value="(state.rule.item as RuleT).enabled"
                    @update:model-value="onCheckboxUpdated"
                    class="border-accent group-hover: data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground size-5 border-2"
                />
                <div class="w-full">
                    {{ i18n.t('RULES_ENABLED') }}
                </div>
            </Label>
            <TooltipWrapper
                :content="i18n.t('RULES_SYNC_DESCRIPTION')"
                side="left"
                class="max-w-60 text-sm"
            >
                <Label
                    class="group hover:bg-secondary text-foreground flex cursor-pointer flex-row items-center gap-2 px-4 py-2 font-normal"
                >
                    <Checkbox
                        v-model="state.rule.item.sync"
                        class="border-accent group-hover: data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground size-5 border-2"
                    />

                    <div class="w-full">
                        {{ i18n.t('RULES_SYNC') }}
                    </div>
                </Label>
            </TooltipWrapper>
            <Separator class="my-2" />
            <Button
                :disabled="!state.ruleChanged"
                class="group hover:bg-secondary text-foregrond flex flex-row items-center gap-2 rounded-none px-4 py-2 font-normal"
                @click="onRevertButtonClick"
            >
                <Undo2Icon class="size-5" />
                {{ i18n.t('RULES_REVERT') }}
            </Button>
            <Button
                class="group hover:bg-destructive/10 text-destructive flex w-full flex-row items-center justify-start gap-2 rounded-none px-4 py-2 font-normal"
                @click="onRemoveButtonClick"
            >
                <Trash2Icon class="size-5" />
                {{ i18n.t('RULES_REMOVE_ONE') }}
            </Button>
        </PopoverContent>
    </Popover>
</template>
