<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/tailwind';
import { TooltipContentProps, type TooltipRootProps, type TooltipTriggerProps } from 'reka-ui';
import { HTMLAttributes } from 'vue';

const props = withDefaults(
    defineProps<{
        contentProps?: TooltipContentProps;
        rootProps?: TooltipRootProps;
        triggerProps?: TooltipTriggerProps;
        content?: string;
        class?: HTMLAttributes['class'];
    }>(),
    {
        contentProps: () => ({}),
        rootProps: () => ({}),
        triggerProps: () => ({}),
    },
);
</script>

<template>
    <Tooltip v-bind="props.rootProps">
        <TooltipTrigger v-bind="props.triggerProps">
            <slot />
        </TooltipTrigger>

        <TooltipContent v-bind="props.contentProps" :class="cn('max-w-56', props.class)">
            <slot name="content" :content="props.content">
                {{ props.content }}
            </slot>
        </TooltipContent>
    </Tooltip>
</template>
