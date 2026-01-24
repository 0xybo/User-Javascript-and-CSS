<script lang="ts" setup>
import AppProvider from '@/components/AppProvider.vue';
import Module from '@/components/Options/Module/ModuleContainer.vue';
import Rule from '@/components/Options/Rule/RuleContainer.vue';
import Settings from '@/components/Options/Settings/SettingsContainer.vue';
import Sidebar from '@/components/Options/Sidebar/SidebarContainer.vue';
import { useState } from '@/composables/options/useState';
import { hasChanged } from '@/composables/useDraft';
import { useStorage } from '@/composables/useStorage';
import { watchThemePalette } from '@/composables/useTheme';
import { Panel } from '@/lib/options/panel';
import type { DraftT } from '@/lib/storage/types';
import { useEventListener } from '@vueuse/core';

watchThemePalette();

const state = useState();
const storage = useStorage();

function onBeforeUnload(event: BeforeUnloadEvent): true | undefined {
    const unsavedDrafts: DraftT[] = storage.drafts.filter((draft) => hasChanged(draft));
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
