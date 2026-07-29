<script lang="ts" setup>
import AppProvider from '@/components/AppProvider.vue';
import PopupBody from '@/components/Popup/PopupBody.vue';
import PopupFooter from '@/components/Popup/PopupFooter.vue';
import PopupHeader from '@/components/Popup/PopupHeader.vue';
import { watchThemePalette } from '@/composables/useTheme';

watchThemePalette();
</script>

<template>
    <div class="max-h-96 w-64 select-none">
        <AppProvider>
            <PopupHeader />
            <PopupBody />
            <PopupFooter />
        </AppProvider>
    </div>
</template>

<style>
/*
For development purposes, the popup is styled to have a white background and a specific width. 
This ensures that the popup content is displayed correctly and is visually distinct from the 
rest of the page while the popup is being opened on a new tab.
*/
body {
    @apply bg-[#fff];
}
#app {
    @apply w-fit bg-[hsl(69.99deg_8.1%_14.5%)];
}
</style>
