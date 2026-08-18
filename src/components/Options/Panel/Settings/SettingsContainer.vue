<script setup lang="ts">
import { nextTick, onMounted, watch } from '#imports';
import useState from '@/composables/options/useState';
import { SettingsSection } from '@/lib/options/settings.js';
import { useTemplateRef, type Component } from 'vue';
import CloudSyncSection from './Sections/CloudSyncSection.vue';
import EditorSection from './Sections/EditorSection.vue';
import ExtensionSection from './Sections/ExtensionSection.vue';
import StorageSection from './Sections/StorageSection.vue';
import ThemeSection from './Sections/ThemeSection.vue';

const state = useState();

/**
 * A mapping of settings sections to their corresponding components and template references.
 * Each section is represented by its ID, the component to render, and a reference to the DOM
 * element.
 *
 * Due to the loop in the template, the ref value is an array of HTMLDivElement, so we use
 * useTemplateRef to get the first element.
 */
const sections: Record<
    SettingsSection,
    { component: Component; ref: ReturnType<typeof useTemplateRef<Array<HTMLDivElement>>> }
> = {
    [SettingsSection.Editor]: {
        component: EditorSection,
        ref: useTemplateRef(SettingsSection.Editor),
    },
    [SettingsSection.Theme]: {
        component: ThemeSection,
        ref: useTemplateRef(SettingsSection.Theme),
    },
    [SettingsSection.Extension]: {
        component: ExtensionSection,
        ref: useTemplateRef(SettingsSection.Extension),
    },
    [SettingsSection.CloudSync]: {
        component: CloudSyncSection,
        ref: useTemplateRef(SettingsSection.CloudSync),
    },
    [SettingsSection.Storage]: {
        component: StorageSection,
        ref: useTemplateRef(SettingsSection.Storage),
    },
};

/**
 * Scrolls to the specified settings section in the DOM.
 *
 * @param section The ID of the settings section to scroll to.
 */
function scrollToSection(section: SettingsSection) {
    const sectionElement = sections[section].ref?.value?.[0];
    if (!sectionElement) return;

    nextTick(() => sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

watch(
    () => state.settingsSection,
    () => state.settingsSection && scrollToSection(state.settingsSection),
);

onMounted(() => state.settingsSection && scrollToSection(state.settingsSection));
</script>

<template>
    <div class="flex h-full w-full min-w-0 flex-col">
        <div class="flex-1 space-y-6 overflow-y-auto p-6">
            <div v-for="[name, { component }] in Object.entries(sections)" :key="name" :ref="name">
                <component :is="component" />
            </div>
        </div>
    </div>
</template>
