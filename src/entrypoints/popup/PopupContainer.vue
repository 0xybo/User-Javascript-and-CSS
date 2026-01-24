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

<style scoped></style>
