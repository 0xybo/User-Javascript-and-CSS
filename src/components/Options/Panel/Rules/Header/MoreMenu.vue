<script setup lang="ts">
import TooltipWrapper from '@/components/TooltipWrapper.vue';
import Button from '@/components/ui/button/Button.vue';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import Label from '@/components/ui/label/Label.vue';
import Popover from '@/components/ui/popover/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import useState from '@/composables/options/useState';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation';
import { IRule, ItemType } from '@/lib/storage/types';
import { EllipsisVerticalIcon, Trash2Icon, Undo2Icon } from 'lucide-vue-next';
import { ref } from 'vue';

const t = useTranslation();
const state = useState();
const storage = useStorage();
const toast = useToast();
/** Whether the popover is opened */
const isOpened = ref(false);

/**
 * Removes the current rule from storage and switches to a new draft
 */
function onRemoveButtonClick() {
    storage.removeItem(state.rule.item);
    state.switchToNewDraft(ItemType.Rule);
    isOpened.value = false;
    toast.info({ title: t('TOAST.RULE.REMOVED') });
}

/**
 * Reverts the current rule to its original state by restoring the script and style content from
 * the stored files
 */
function onRevertButtonClick() {
    const item = state.rule.item as IRule;
    state.rule.files[item.script.id] = item.script.content;
    state.rule.files[item.style.id] = item.style.content;
    isOpened.value = false;
}

/**
 * Updates the enabled state of the current rule based on the checkbox value
 */
function onCheckboxUpdated(value: boolean | 'indeterminate') {
    if (value === 'indeterminate') return;
    (state.rule.item as IRule).enabled = value;
    toast.info({
        title: t(value ? 'TOAST.RULE.ENABLED' : 'TOAST.RULE.DISABLED'),
    });
}
</script>

<template>
    <Popover v-model:open="isOpened">
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
                class="hover:bg-secondary text-foreground flex cursor-pointer flex-row items-center gap-2 px-4 py-2 font-normal"
            >
                <Checkbox
                    :default-value="(state.rule.item as IRule).enabled"
                    @update:model-value="onCheckboxUpdated"
                    class="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground size-5 border-2"
                />
                <div class="w-full">
                    {{ t('RULES.ENABLED') }}
                </div>
            </Label>
            <TooltipWrapper
                :content="t('RULES.SYNC_DESCRIPTION')"
                side="left"
                class="max-w-60 text-sm"
            >
                <Label
                    class="hover:bg-secondary text-foreground flex cursor-pointer flex-row items-center gap-2 px-4 py-2 font-normal"
                >
                    <Checkbox
                        v-model="state.rule.item.sync"
                        class="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground size-5 border-2"
                    />

                    <div class="w-full">
                        {{ t('RULES.SYNC') }}
                    </div>
                </Label>
            </TooltipWrapper>
            <Separator class="my-2" />
            <Button
                :disabled="!state.ruleUnsaved"
                class="hover:bg-secondary text-foregrond flex flex-row items-center gap-2 rounded-none px-4 py-2 font-normal"
                @click="onRevertButtonClick"
            >
                <Undo2Icon class="size-5" />
                {{ t('RULES.REVERT') }}
            </Button>
            <Button
                class="hover:bg-destructive/10 text-destructive flex w-full flex-row items-center justify-start gap-2 rounded-none px-4 py-2 font-normal"
                @click="onRemoveButtonClick"
            >
                <Trash2Icon class="size-5" />
                {{ t('RULES.REMOVE_ONE') }}
            </Button>
        </PopoverContent>
    </Popover>
</template>
