<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipContentProps } from 'reka-ui';
import { HTMLAttributes } from 'vue';

const { content, ...props } = defineProps<
    TooltipContentProps & {
        content: string;
        class?: HTMLAttributes['class'];
    }
>();
</script>

<template>
    <Tooltip>
        <TooltipTrigger as-child>
            <slot />
        </TooltipTrigger>

        <TooltipContent v-bind="props">
            {{ content }}
        </TooltipContent>
    </Tooltip>
</template>
