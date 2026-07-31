<script lang="ts" setup>
import AppProvider from '@/components/AppProvider.vue';
import Module from '@/components/Options/Panel/Modules/ModuleContainer.vue';
import Rule from '@/components/Options/Panel/Rules/RuleContainer.vue';
import Settings from '@/components/Options/Panel/Settings/SettingsContainer.vue';
import Sidebar from '@/components/Options/Sidebar/SidebarContainer.vue';
import { useState } from '@/composables/options/useState';
import { useStorage } from '@/composables/useStorage';
import { watchThemePalette } from '@/composables/useTheme';
import { Panel } from '@/lib/options/tab';
import type { IDraft } from '@/lib/storage/types';
import { isUnsaved } from '@/lib/storage/utils';
import { useEventListener } from '@vueuse/core';

watchThemePalette();

const state = useState();
const storage = useStorage();

/**
 * Handles the beforeunload event to warn the user about unsaved drafts.
 *
 * @param event The beforeunload event.
 * @returns true if there are unsaved drafts, undefined otherwise.
 */
function onBeforeUnload(event: BeforeUnloadEvent): true | undefined {
    const unsavedDrafts: IDraft[] = storage.drafts.filter((draft) => isUnsaved(draft));
    if (unsavedDrafts.length) {
        event.preventDefault();
        return true;
    }
}
useEventListener(window, 'beforeunload', onBeforeUnload);
</script>

<template>
    <AppProvider>
        <div class="flex h-full flex-row">
            <Sidebar />
            <Rule v-if="state.panel === Panel.Rule" />
            <Module v-else-if="state.panel === Panel.Module" />
            <Settings v-else-if="state.panel === Panel.Settings" />
        </div>
    </AppProvider>
</template>

<style scoped></style>
