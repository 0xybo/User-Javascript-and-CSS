<script setup lang="ts">
import { IModule } from '@/lib/storage/types';
import ModuleListItem from './ModuleListItem.vue';

const props = defineProps<{ modules: IModule[]; openedModuleId?: string }>();
const emits = defineEmits<{
    open: [IModule];
}>();
</script>

<template>
    <ModuleListItem
        v-for="module of props.modules"
        :key="module.id"
        :module="module"
        @open="() => emits('open', module)"
        :opened="props.openedModuleId === module.id"
    />
</template>
