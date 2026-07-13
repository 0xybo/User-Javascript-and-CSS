<script setup lang="ts">
import { computed, i18n, ref } from '#imports';
import CodeEditor from '@/components/Editor/CodeEditor.vue';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ResizableHandle from '@/components/ui/resizable/ResizableHandle.vue';
import { useState } from '@/composables/options/useState';
import { FileType, RuleT } from '@/lib/storage/types';

const state = useState();
const scriptContent = computed({
    get: () => state.rule.files[(state.rule.item as RuleT).script.id],
    set: (value: string) => (state.rule.files[(state.rule.item as RuleT).script.id] = value),
});
const styleContent = computed({
    get: () => state.rule.files[(state.rule.item as RuleT).style.id],
    set: (value: string) => (state.rule.files[(state.rule.item as RuleT).style.id] = value),
});
const resizing = ref<boolean>(false);

function onResizableHandleDragging(isDragging: boolean) {
    resizing.value = isDragging;
}
</script>

<template>
    <ResizablePanelGroup direction="horizontal" class="flex h-full w-full min-w-0 grow-0 flex-row">
        <ResizablePanel :default-size="50" :min-size="5">
            <CodeEditor
                :language="FileType.Typescript"
                v-model="scriptContent"
                :resizing="resizing"
                :placeholder="i18n.t('RULES_PLACEHOLDER_SCRIPT')"
            />
        </ResizablePanel>
        <ResizableHandle
            @dragging="onResizableHandleDragging"
            class="bg-primary hover:bg-accent/50 data-[state=drag]:bg-accent w-1 transition-colors after:content-none"
        />
        <ResizablePanel :default-size="50" :min-size="5">
            <CodeEditor
                :language="FileType.Css"
                v-model="styleContent"
                :resizing="resizing"
                :placeholder="i18n.t('RULES_PLACEHOLDER_STYLE')"
            />
        </ResizablePanel>
    </ResizablePanelGroup>
</template>
