<script setup lang="ts">
import { useState } from '@/composables/options/useState';
import { useMagicKeys } from '@/composables/useMagicKeys';
import { useStorage } from '@/composables/useStorage';
import { whenever } from '@vueuse/core';
import Editors from './RuleEditors.vue';
import Header from './RuleHeader.vue';

const storage = useStorage();
const state = useState();
const { Ctrl_S, Alt_Z } = useMagicKeys({ preventDefault: true });

whenever(Ctrl_S, () => state.ruleChanged && storage.saveDraft(state.rule));
whenever(Alt_Z, () => (storage.settings.editor.wrap = !storage.settings.editor.wrap));
</script>

<template>
    <div class="flex h-full w-full min-w-0 grow-0 flex-col">
        <Header />
        <Editors />
    </div>
</template>
