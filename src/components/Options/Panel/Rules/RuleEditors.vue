<script setup lang="ts">
import { computed, ref } from '#imports';
import CodeEditor from '@/components/Editor/CodeEditor.vue';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ResizableHandle from '@/components/ui/resizable/ResizableHandle.vue';
import useState from '@/composables/options/useState';
import useTranslation from '@/composables/useTranslation';
import { FileType } from '@/lib/storage/types';

const t = useTranslation();
const state = useState();
const scriptContent = computed({
    get: () => state.rule.files[state.rule.item.script.id],
    set: (value: string) => (state.rule.files[state.rule.item.script.id] = value),
});
const styleContent = computed({
    get: () => state.rule.files[state.rule.item.style.id],
    set: (value: string) => (state.rule.files[state.rule.item.style.id] = value),
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
                :placeholder="t('RULES.PLACEHOLDER_SCRIPT')"
            />
        </ResizablePanel>
        <ResizableHandle
            @dragging="onResizableHandleDragging"
            class="bg-primary hover:bg-accent/50 data-[state=drag]:bg-accent w-1 transition-colors after:content-none"
        />
        <ResizablePanel :default-size="50" :min-size="5">
            <CodeEditor
                :language="FileType.Scss"
                v-model="styleContent"
                :resizing="resizing"
                :placeholder="t('RULES.PLACEHOLDER_STYLE')"
            />
        </ResizablePanel>
    </ResizablePanelGroup>
</template>
