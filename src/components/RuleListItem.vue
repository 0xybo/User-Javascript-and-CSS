<script setup lang="ts">
// import { useDraft } from '@/composables/useDraft';
import { computed } from '#imports';
import useState from '@/composables/options/useState.ts';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation.ts';
import { getName } from '@/lib/rules';
import { IRule } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind';
import TooltipWrapper from './TooltipWrapper.vue';
import Switch from './ui/switch/Switch.vue';

const props = withDefaults(defineProps<{ rule: IRule; opened?: boolean }>(), { opened: false });
const emits = defineEmits<{
    disable: [];
    enable: [];
    change: [boolean];
    open: [];
}>();
const state = useState();
const storage = useStorage();
const { push } = useToast();
const t = useTranslation();

/** The name of the rule. */
const name = computed(() => getName(props.rule));
/** The draft associated with the rule. */
const draft = computed(() => storage.getDraftFromItem(props.rule));
/** Whether the current draft is associated with the rule. */
const isCurrentDraft = computed(() => draft.value?.item.id === state.rule.item.id);
/** Whether the rule has been changed or is new. */
const hasChanged = computed(() => draft.value?.changed || draft.value?.isNew);

/**
 * Opens the rule list item if it is not already opened. Emits an 'open' event to notify the
 * parent component.
 */
function open() {
    if (props.opened) return;
    emits('open');
}

/**
 * Handles the change event when the switch is toggled. Updates the rule's enabled state and emits
 * corresponding events.
 *
 * @param value - The new enabled state of the rule.
 */
function onSwitchChange(value: boolean) {
    props.rule.enabled = value;
    emits('change', value);
    if (value) emits('enable');
    else emits('disable');
    push({ title: t(value ? 'TOAST.RULE_ENABLED' : 'TOAST.RULE_DISABLED'), variant: 'info' });
}

/**
 * Handles the click event on the switch to prevent it from propagating to parent elements.
 *
 * @param e - The mouse event triggered by the click.
 */
function onSwitchClick(e: MouseEvent) {
    e.stopPropagation();
}
</script>

<template>
    <div
        :class="
            cn(
                'hover:bg-primary/20 group flex w-full flex-row items-center justify-between gap-2 px-4 py-4',
                { 'bg-primary/20': props.opened, 'cursor-pointer': !props.opened },
            )
        "
        @click="open"
    >
        <div class="flex min-h-8 flex-row items-center justify-center gap-3 overflow-hidden">
            <TooltipWrapper :content="t('COMMON.DRAFT')">
                <div v-if="hasChanged" class="bg-accent size-3 shrink-0 rounded-full p-0" />
            </TooltipWrapper>
            <div
                :class="
                    cn('flex w-full flex-col items-start overflow-hidden', {
                        italic: hasChanged,
                    })
                "
            >
                <TooltipWrapper :content="name">
                    <div class="w-full overflow-hidden text-xs text-nowrap text-ellipsis">
                        {{ name }}
                    </div>
                </TooltipWrapper>
                <TooltipWrapper :content="props.rule.patterns">
                    <div class="text-muted overflow-hidden text-xs text-nowrap text-ellipsis">
                        {{ props.rule.patterns }}
                    </div>
                </TooltipWrapper>
            </div>
        </div>
        <Switch
            :model-value="props.rule.enabled"
            @update:model-value="onSwitchChange"
            @click="onSwitchClick"
            :class="
                cn(
                    'bg-secondary! h-4 w-7',
                    '[&>span]:size-2 [&>span]:transition-all [&>span[data-state=unchecked]]:translate-x-0.5',
                    {
                        'border-primary [&>span]:bg-primary border-2 bg-transparent!':
                            !props.rule.enabled,
                        'hover:border-primary-foreground/50 hover:[&>span]:bg-primary-foreground/50':
                            !props.rule.enabled,
                        'hover:bg-primary-foreground/50!': props.rule.enabled,
                    },
                )
            "
        />
    </div>
</template>
