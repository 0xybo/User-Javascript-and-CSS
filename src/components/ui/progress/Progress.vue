<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { ProgressRootProps } from 'reka-ui';
import { ProgressIndicator, ProgressRoot } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/tailwind';

const props = withDefaults(
    defineProps<ProgressRootProps & { class?: HTMLAttributes['class'] } & { indicatorClass?: string }>(),
    {
        modelValue: 0,
        indicatorClass: 'bg-primary',
    },
);

const delegatedProps = reactiveOmit(props, 'class', 'indicatorClass');
</script>

<template>
    <ProgressRoot
        v-bind="delegatedProps"
        :class="
            cn(
                'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
                props.class,
            )
        "
    >
        <ProgressIndicator
            :class="cn('h-full w-full flex-1 transition-all', props.indicatorClass)"
            :style="`transform: translateX(-${100 - (props.modelValue ?? 0)}%);`"
        />
    </ProgressRoot>
</template>