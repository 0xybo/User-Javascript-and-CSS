<script setup lang="ts">
import { computed } from '#imports';
import { useEditorSettings } from '@/composables/useStorage';
import { useTheme } from '@/composables/useTheme';
import { EditorMonacoT } from '@/lib/storage/editor';
import type { FileType } from '@/lib/storage/types';
import { CodeEditor } from 'monaco-editor-vue3';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { useTemplateRef } from 'vue';

const props = withDefaults(
    defineProps<{
        language: FileType;
        minimap?: boolean;
        placeholder?: string;
        readonly?: boolean;
    }>(),
    {
        minimap: true,
        readonly: false,
    },
);
const model = defineModel<string>({ required: true });
const settings = useEditorSettings<EditorMonacoT>();
const theme = useTheme();

const monacoTheme = computed(() => (theme.value === 'dark' ? 'vs-dark' : 'vs'));

const options = computed<editor.IStandaloneEditorConstructionOptions>(() => ({
    fontSize: settings.fontSize,
    minimap: {
        enabled: props.minimap && settings.minimap,
    },
    insertSpaces: settings.softTabs,
    renderWhitespace: settings.invisibleChars ? 'all' : 'none',
    renderControlCharacters: settings.invisibleChars,
    wordWrap: settings.wrap ? 'on' : 'off',
    tabSize: settings.tabSize,
    fontFamily: settings.fontFamily,
    fontLigatures: settings.ligatures,
    theme: monacoTheme.value,
    automaticLayout: true,
    placeholder: props.placeholder,
    language: props.language,
    readOnly: props.readonly,
}));

const containerRef = useTemplateRef('container');
</script>

<template>
    <div ref="container" class="h-full w-full min-w-0 grow-0">
        <CodeEditor v-if="containerRef" v-model:value="model" :options="options" />
    </div>
</template>
