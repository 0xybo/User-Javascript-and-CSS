<script setup lang="ts">
import { watch, nextTick } from '#imports';
import { useState } from '@/composables/options/useState';
import CloudSyncSection from './Sections/CloudSyncSection.vue';
import EditorSection from './Sections/EditorSection.vue';
import ExtensionSection from './Sections/ExtensionSection.vue';
import StorageSection from './Sections/StorageSection.vue';
import ThemeSection from './Sections/ThemeSection.vue';

const state = useState();

watch(
    () => state.settingsSection,
    (section) => {
        if (!section) return;
        nextTick(() => {
            const el = document.getElementById(`settings-${section}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    },
);
</script>

<template>
    <div class="flex h-full w-full min-w-0 flex-col">
        <div class="flex-1 space-y-6 overflow-y-auto p-6">
            <EditorSection />
            <ThemeSection />
            <ExtensionSection />
            <CloudSyncSection />
            <StorageSection />
        </div>
    </div>
</template>
