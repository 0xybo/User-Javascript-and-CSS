<script lang="ts" setup>
import App from '@/components/App.vue';
import Editor from '@/components/Options/Editor.vue';
import Sidebar from '@/components/Options/Sidebar.vue';
import { watchThemePalette } from '@/composables/useTheme';

watchThemePalette();
</script>

<template>
    <App>
        <div class="flex h-full flex-row">
            <Sidebar />
            <Editor />
        </div>
    </App>
</template>

<style scoped></style>
