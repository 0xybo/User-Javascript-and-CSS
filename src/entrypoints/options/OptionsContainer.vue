<script lang="ts" setup>
import AppProvider from '@/components/AppProvider.vue';
import Module from '@/components/Options/Module/ModuleContainer.vue';
import Rule from '@/components/Options/Rule/RuleContainer.vue';
import Settings from '@/components/Options/Settings/SettingsContainer.vue';
import Sidebar from '@/components/Options/Sidebar/SidebarContainer.vue';
import { useState } from '@/composables/options/useState';
import { watchThemePalette } from '@/composables/useTheme';
import { Panel } from '@/lib/options/panel';

watchThemePalette();

const state = useState();

// TODO Alert before exit
// TODO remove draft on exit
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
