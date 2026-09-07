<script setup lang="ts">
import { computed } from '#imports';
import useState from '@/composables/options/useState.ts';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation.ts';
import { IModule } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind';
import TooltipWrapper from '@/components/TooltipWrapper.vue';

const props = withDefaults(defineProps<{ module: IModule; opened?: boolean }>(), {
    opened: false,
});
const emits = defineEmits<{
    open: [];
}>();
const state = useState();
const storage = useStorage();
const t = useTranslation();

/** The display name of the module, falling back to the package name or id. */
const name = computed(() => props.module.name || props.module.package || props.module.id);
/** The draft associated with the module. */
const draft = computed(() => storage.getDraftFromItem(props.module));
/** Whether the module draft has unsaved changes. */
const hasChanged = computed(() => draft.value?.changed || draft.value?.isNew);
/** Short summary of the module's files (e.g. "JS, CSS"). */
const fileSummary = computed(() =>
    props.module.files
        .map((f) => (f.type === 'javascript' || f.type === 'typescript' ? 'JS' : 'CSS'))
        .join(', '),
);

/**
 * Opens the module list item if it is not already opened. Emits an 'open' event to notify the
 * parent component.
 */
function open() {
    if (props.opened) return;
    emits('open');
}
</script>

<template>
    <div
        :class="
            cn(
                'hover:bg-primary/20 group flex w-full flex-row items-center justify-between gap-2 border-l-2 border-transparent px-4 py-4 transition-colors',
                { 'bg-primary/20 border-accent': props.opened, 'cursor-pointer': !props.opened },
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
                    cn('flex w-full flex-col items-start overflow-hidden', { italic: hasChanged })
                "
            >
                <TooltipWrapper :content="name">
                    <div class="w-full overflow-hidden text-xs text-nowrap text-ellipsis">
                        {{ name }}
                    </div>
                </TooltipWrapper>
                <TooltipWrapper :content="fileSummary">
                    <div class="text-muted overflow-hidden text-xs text-nowrap text-ellipsis">
                        {{ fileSummary }}
                    </div>
                </TooltipWrapper>
            </div>
        </div>
    </div>
</template>
