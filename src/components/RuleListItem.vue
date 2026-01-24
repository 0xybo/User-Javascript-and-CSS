<script setup lang="ts">
// import { useDraft } from '@/composables/useDraft';
import { computed, i18n } from '#imports';
import { useStorage } from '@/composables/useStorage';
import { getName } from '@/lib/rules';
import { RuleT } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind';
import TooltipWrapper from './TooltipWrapper.vue';
import Switch from './ui/switch/Switch.vue';

const props = withDefaults(defineProps<{ rule: RuleT; opened?: boolean }>(), { opened: false });
const emits = defineEmits<{
    disable: [];
    enable: [];
    change: [boolean];
    open: [];
}>();
const storage = useStorage();

const name = computed(() => getName(props.rule));
const draft = computed(() => storage.getDraftFromItem(props.rule));

function open() {
    if (props.opened) return;
    emits('open');
}

function onSwitchChange() {
    emits('change', props.rule.enabled);
    if (props.rule.enabled) emits('enable');
    else emits('disable');
}

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
            <TooltipWrapper :content="i18n.t('COMMON_DRAFT')">
                <div
                    v-if="draft?.changed || draft?.isNew"
                    class="bg-accent size-3 shrink-0 rounded-full p-0"
                />
            </TooltipWrapper>
            <div
                :class="
                    cn('flex w-full flex-col overflow-hidden', {
                        italic: draft?.changed || draft?.isNew,
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
            v-model="props.rule.enabled"
            @update:model-value="onSwitchChange"
            @click="onSwitchClick"
            :class="
                cn(
                    'bg-secondary! h-4 w-7',
                    '[&>span]:size-2 [&>span[data-state=unchecked]]:translate-x-0.5',
                    {
                        'group-hover:bg-primary-foreground/50!': !props.opened,
                        'pointer-events-none': props.opened,
                    },
                )
            "
        />
    </div>
</template>
