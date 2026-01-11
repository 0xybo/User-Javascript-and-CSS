<script lang="ts" setup>
import App from '@/components/App.vue';
import Footer from '@/components/Popup/Footer.vue';
import Header from '@/components/Popup/Header.vue';
import { useStorage } from '@/composables/useStorage';
import { watchThemePalette } from '@/composables/useTheme';

const storage = useStorage();
const rules = storage.rules;

watchThemePalette();
</script>

<template>
    <App>
        <div class="max-h-96 w-64 select-none">
            <Header />
            <div class="min-h-15">
                <div v-if="!rules.length" class="text-muted px-4 py-5">{{ i18n.t('POPUP_NO_RULES') }}</div>
            </div>
            <Footer />
        </div>
    </App>
</template>

<style scoped></style>
