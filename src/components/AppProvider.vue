<script setup lang="ts">
import { ref } from '#imports';
import { useStorage } from '@/composables/useStorage';
import { watchTheme } from '@/composables/useTheme';
import GlobalConfirmDialog from './GlobalConfirmDialog.vue';
import GlobalDialog from './GlobalDialog.vue';
import Spinner from './ui/spinner/Spinner.vue';
import TooltipProvider from './ui/tooltip/TooltipProvider.vue';

watchTheme();

const storage = useStorage();
const showSpinner = ref(false);

setTimeout(() => {
    showSpinner.value = true;
}, 1000);
</script>

<template>
    <TooltipProvider :delay-duration="500">
        <div v-if="storage.loaded" class="h-full w-full">
            <slot />
        </div>
        <div v-else class="flex h-full w-full items-center justify-center">
            <Spinner class="size-14" v-if="showSpinner" />
        </div>
    </TooltipProvider>
    <GlobalConfirmDialog />
    <GlobalDialog />
</template>
