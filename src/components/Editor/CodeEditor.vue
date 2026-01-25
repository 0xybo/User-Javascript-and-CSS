<script setup lang="ts">
import { useStorage } from '@/composables/useStorage';
import { Editor } from '@/lib/storage/editor';
import type { FileType } from '@/lib/storage/types';
import ActionsBar from './Actions/ActionsBar.vue';
import MonacoEditor from './MonacoEditor.vue';

const storage = useStorage();
const props = withDefaults(
    defineProps<{
        placeholder?: string;
        language: FileType;
        resizing: boolean;
    }>(),
    { resizing: false },
);
const model = defineModel<string>({ required: true });
</script>

<template>
    <div class="relative h-full w-full">
        <MonacoEditor
            v-if="storage.settings.editor.name === Editor.Monaco"
            v-model="model"
            :minimap="!resizing"
            :language="props.language"
            :placeholder="props.placeholder"
        />
        <ActionsBar :type="props.language" />
    </div>
</template>
