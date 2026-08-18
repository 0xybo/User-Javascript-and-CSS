<script setup lang="ts">
import { computed } from '#imports';
import Progress from '@/components/ui/progress/Progress.vue';
import useTranslation from '@/composables/useTranslation';
import { formatBytes } from '@/lib/utils';

const t = useTranslation();

const props = withDefaults(
    defineProps<{
        /** Number of bytes currently used. */
        used: number;
        /** Total number of bytes available. */
        quota: number;
        /** Translated title displayed next to the used/quota caption. */
        title: string;
        /** Usage percentage at which the bar turns into the warning color. */
        warningThreshold?: number;
    }>(),
    {
        warningThreshold: 90,
    },
);

const percentage = computed(() => {
    if (props.quota <= 0) return 0;
    return Math.min(100, Math.round((props.used / props.quota) * 100));
});

const indicatorClass = computed(() => {
    if (percentage.value >= 100) return 'bg-destructive';
    if (percentage.value >= props.warningThreshold) return 'bg-warning';
    return 'bg-secondary';
});

const freeBytes = computed(() => Math.max(0, props.quota - props.used));
</script>

<template>
    <div class="space-y-2">
        <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-xs">{{ title }}</span>
            <span class="text-xs font-medium">
                {{ formatBytes(used) }} / {{ formatBytes(quota) }}
            </span>
        </div>
        <Progress :model-value="percentage" :indicator-class="indicatorClass" />
        <p class="text-muted-foreground text-xs">
            {{ t('SETTINGS.STORAGE_FREE', [formatBytes(freeBytes)]) }}
        </p>
        <slot />
    </div>
</template>
