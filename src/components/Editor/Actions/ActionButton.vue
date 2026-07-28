<script setup lang="ts">
import { computed, type Component } from '#imports';
import TooltipWrapper from '@/components/TooltipWrapper.vue';
import Button from '@/components/ui/button/Button.vue';
import { cn } from '@/lib/tailwind';

const props = withDefaults(
    defineProps<{
        bubble?: boolean;
        icon: Component;
        tooltip?: {
            title: string;
            description?: string;
        };
        disabled?: boolean;
    }>(),
    {
        bubble: false,
    },
);
const activeModel = defineModel<boolean>('active', { required: false });
const emits = defineEmits<{
    click: [];
}>();
const tooltipProps = computed(() =>
    props.tooltip
        ? {
              class: 'max-w-80',
              contentProps: {
                  side: 'top',
                  sideOffset: 7,
                  avoidCollisions: true,
                  collisionPadding: { left: 20 },
              },
          }
        : {},
);

function onButtonClick() {
    if (activeModel.value !== undefined) activeModel.value = !activeModel.value;
    emits('click');
}
</script>

<template>
    <component v-bind="tooltipProps" :is="props.tooltip ? TooltipWrapper : 'div'">
        <Button
            variant="ghost"
            @click="onButtonClick"
            class="hover:bg-primary hover:text-primary-foreground relative size-9 p-2"
            :disabled="props.disabled"
        >
            <component :is="props.icon" />
            <div
                v-if="props.bubble"
                :class="
                    cn('bg-secondary absolute top-1 right-1 size-2 rounded-full', {
                        'bg-accent': activeModel,
                    })
                "
            />
        </Button>

        <template v-if="props.tooltip" #content>
            <div v-if="props.tooltip.title" class="mb-1 text-sm">
                {{ props.tooltip.title }}
            </div>
            <div v-if="props.tooltip.description" class="text-foreground/75">
                {{ props.tooltip.description }}
            </div>
        </template>
    </component>
</template>
