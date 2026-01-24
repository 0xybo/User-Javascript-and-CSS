<script setup lang="ts">
import { computed, ref } from '#imports';
import MonacoEditor from '@/components/Editor/Monaco/MonacoEditor.vue';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ResizableHandle from '@/components/ui/resizable/ResizableHandle.vue';
import { useState } from '@/composables/options/useState';
import { RuleT } from '@/lib/storage/types';

const state = useState();
const scriptContent = computed({
    get: () => state.rule.files[(state.rule.item as RuleT).script.id],
    set: (value: string) => (state.rule.files[(state.rule.item as RuleT).script.id] = value),
});
const styleContent = computed({
    get: () => state.rule.files[(state.rule.item as RuleT).style.id],
    set: (value: string) => (state.rule.files[(state.rule.item as RuleT).style.id] = value),
});
const minimap = ref<boolean>(true);

function onResizableHandleDragging(isDragging: boolean) {
    minimap.value = !isDragging;
}
</script>

<template>
    <ResizablePanelGroup direction="horizontal" class="flex h-full w-full min-w-0 grow-0 flex-row">
        <ResizablePanel :default-size="50" :min-size="5">
            <MonacoEditor language="typescript" v-model="scriptContent" :minimap="minimap" />
        </ResizablePanel>
        <ResizableHandle
            @dragging="onResizableHandleDragging"
            class="bg-primary hover:bg-accent/50 data-[state=drag]:bg-accent w-1 transition-colors after:content-none"
        />
        <ResizablePanel :default-size="50" :min-size="5">
            <MonacoEditor language="scss" v-model="styleContent" :minimap="minimap" />
        </ResizablePanel>
    </ResizablePanelGroup>
</template>
