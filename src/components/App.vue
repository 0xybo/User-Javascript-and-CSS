<script setup lang="ts">
import { watchTheme } from '@/composables/useTheme';
import GlobalAlert from './GlobalAlert.vue';
import TooltipProvider from './ui/tooltip/TooltipProvider.vue';

watchTheme();
</script>

<template>
    <TooltipProvider>
        <slot />
    </TooltipProvider>
    <GlobalAlert />
</template>
