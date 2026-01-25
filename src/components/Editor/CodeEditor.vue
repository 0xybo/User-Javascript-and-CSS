<script setup lang="ts">
import { useStorage } from '@/composables/useStorage';
import { Editor } from '@/lib/storage/editor';
import MonacoEditor from './MonacoEditor.vue';

const storage = useStorage();
const props = withDefaults(
    defineProps<{
        placeholder?: string;
        language: 'scss' | 'typescript';
        resizing: boolean;
    }>(),
    { resizing: false },
);
const model = defineModel<string>({ required: true });
</script>

<template>
    <MonacoEditor
        v-if="storage.settings.editor.name === Editor.Monaco"
        v-model="model"
        :minimap="!resizing"
        :language="props.language"
        :placeholder="props.placeholder"
    />
</template>
