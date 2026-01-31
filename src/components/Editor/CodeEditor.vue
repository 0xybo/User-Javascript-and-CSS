<script setup lang="ts">
import { useStorage } from '@/composables/useStorage';
import { Editor } from '@/lib/storage/editor';
import type { FileType } from '@/lib/storage/types';
import ActionsBar from './Actions/ActionsBar.vue';
import MonacoEditor from './MonacoEditor.vue';

const storage = useStorage();
const props = withDefaults(
    defineProps<{
        language: FileType;
        placeholder?: string;
        resizing?: boolean;
        readonly?: boolean;
        actionsBar?: boolean;
    }>(),
    { resizing: false, readonly: false, actionsBar: true },
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
            :readonly="props.readonly"
        />
        <ActionsBar v-if="props.actionsBar" :type="props.language" />
    </div>
</template>
