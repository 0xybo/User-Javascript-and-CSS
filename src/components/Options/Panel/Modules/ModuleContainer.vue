<script setup lang="ts">
import useState from '@/composables/options/useState';
import { useMagicKeys } from '@/composables/useMagicKeys';
import { useStorage } from '@/composables/useStorage';
import { whenever } from '@vueuse/core';
import Editors from './ModuleEditors.vue';
import Header from './ModuleHeader.vue';
import Review from './ModuleReview.vue';

const storage = useStorage();
const state = useState();
const { Ctrl_S } = useMagicKeys({ preventDefault: true });

whenever(Ctrl_S, () => state.moduleUnsaved && storage.saveModuleDraft(state.module));
</script>

<template>
    <div class="flex h-full w-full min-w-0 grow-0 flex-col">
        <Header />
        <Editors />
        <Review :module="state.module.item" />
    </div>
</template>
