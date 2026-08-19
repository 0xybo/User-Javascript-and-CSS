<script setup lang="ts">
import { ref } from '#imports';
import CodeEditor from '@/components/Editor/CodeEditor.vue';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ResizableHandle from '@/components/ui/resizable/ResizableHandle.vue';
import useState from '@/composables/options/useState';
import useTranslation from '@/composables/useTranslation';
import { FileType } from '@/lib/storage/types';

const t = useTranslation();
const state = useState();
const resizing = ref<boolean>(false);

/**
 * Handles the dragging state of the resizable handle. When the handle is being dragged, the
 * `resizing` state is updated accordingly.
 *
 * Watching this state allows the CodeEditor components to hide the minimap and other UI elements
 * that may interfere with the resizing experience (e.g., flickering or performance issues).
 *
 * @param isDragging - A boolean indicating whether the resizable handle is currently being
 * dragged.
 * @sideffect Mutates the `resizing` ref to reflect the current dragging state of the resizable
 * handle.
 */
function onResizableHandleDragging(isDragging: boolean) {
    resizing.value = isDragging;
}
</script>

<template>
    <ResizablePanelGroup direction="horizontal" class="flex h-full w-full min-w-0 grow-0 flex-row">
        <ResizablePanel :default-size="50" :min-size="5">
            <CodeEditor
                :language="FileType.Typescript"
                v-model="state.rule.files[state.rule.item.script.id]"
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
                v-model="state.rule.files[state.rule.item.style.id]"
                :resizing="resizing"
                :placeholder="t('RULES.PLACEHOLDER_STYLE')"
            />
        </ResizablePanel>
    </ResizablePanelGroup>
</template>
