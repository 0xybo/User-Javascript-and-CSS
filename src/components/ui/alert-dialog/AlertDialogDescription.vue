<script setup lang="ts">
import { cn } from '@/lib/tailwind';
import { reactiveOmit } from '@vueuse/core';
import type { AlertDialogDescriptionProps } from 'reka-ui';
import { AlertDialogDescription } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

const props = defineProps<AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
    <AlertDialogDescription
        v-bind="delegatedProps"
        :class="cn('text-muted-foreground text-sm', props.class)"
    >
        <slot />
    </AlertDialogDescription>
</template>
