<script setup lang="ts">
import { computed, ref } from '#imports';
import CodeEditor from '@/components/Editor/CodeEditor.vue';
import TooltipWrapper from '@/components/TooltipWrapper.vue';
import Button from '@/components/ui/button/Button.vue';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ResizableHandle from '@/components/ui/resizable/ResizableHandle.vue';
import useState from '@/composables/options/useState';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation';
import { FileType, IFile } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind';
import { useClipboard } from '@vueuse/core';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    FileCode2Icon,
    GripVerticalIcon,
    Link2Icon,
    RefreshCwIcon,
    Trash2Icon,
} from 'lucide-vue-next';

const t = useTranslation();
const state = useState();
const toast = useToast();
const { copy } = useClipboard();

/** The list of files of the current module, in display order. */
const files = computed<IFile[]>(() => state.module.item.files);

/** The minimum height (in pixels) of an editor panel when resizing. */
const MIN_PX = 34;

/** The id of the file currently being dragged for reordering. */
const draggingId = ref<string | null>(null);
/** Whether a resize handle is currently being dragged. */
const draggingHandle = ref(false);

/**
 * Handles the start of a drag for reordering a file panel. Stores the dragged file id and marks
 * the drag data transfer as a move operation.
 *
 * @param event The drag start event.
 * @param id The id of the dragged file.
 */
function onHeaderDragStart(event: DragEvent, id: string) {
    draggingId.value = id;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
    }
}

/**
 * Ends the drag for reordering a file panel.
 */
function onHeaderDragEnd() {
    draggingId.value = null;
}

/**
 * Reorders the file list while dragging over a panel header. The dragged file is moved one
 * position at a time toward the target, above or below the mid-point of the target header,
 * resulting in a stable bubble-sort style reordering.
 *
 * @param event The dragover event.
 * @param targetId The id of the file whose header is being dragged over.
 */
function onHeaderDragOver(event: DragEvent, targetId: string) {
    const fromId = draggingId.value;
    if (!fromId || fromId === targetId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const before = event.clientY < rect.top + rect.height / 2;

    const arr = state.module.item.files;
    const from = arr.findIndex((f) => f.id === fromId);
    const to = arr.findIndex((f) => f.id === targetId);
    if (from < 0 || to < 0) return;

    if ((before && from > to) || (!before && from < to)) {
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
    }
}

/**
 * Returns the editor language for a given file type. Modules support plain JavaScript and CSS
 * files.
 *
 * @param type The file type.
 * @returns The matching CodeEditor language.
 */
function editorLanguage(type: FileType): FileType {
    if (type === FileType.Css || type === FileType.Scss) return FileType.Css;
    return FileType.Javascript;
}

/**
 * Returns the editor placeholder for a given file type.
 *
 * @param type The file type.
 * @returns The placeholder text for the file type.
 */
function placeholder(type: FileType): string {
    if (type === FileType.Css || type === FileType.Scss) return t('MODULES.PLACEHOLDER_CSS');
    return t('MODULES.PLACEHOLDER_JS');
}

/**
 * Returns the display label of a file: its name when present, otherwise a default derived from
 * its type.
 *
 * @param file The file.
 * @returns The display label of the file.
 */
function displayName(file: IFile): string {
    if (file.name) return file.name;
    return file.type === FileType.Css || file.type === FileType.Scss ? 'style.css' : 'script.js';
}

/**
 * Returns whether the file has a CSS type.
 *
 * @param type The file type.
 * @returns True if the file is a CSS file.
 */
function isCss(type: FileType): boolean {
    return type === FileType.Css || type === FileType.Scss;
}

/**
 * Removes a file from the current module draft by its id.
 *
 * @param fileId The id of the file to remove.
 */
function removeFile(fileId: string) {
    state.removeModuleFile(fileId);
}

/**
 * Handles content changes coming from a file editor. Local files write into the draft content
 * buffer; remote files are read-only in the editor and are only updated by refreshing them.
 *
 * @param file The file being edited.
 * @param value The new content of the editor.
 */
function onModelUpdate(file: IFile, value: string) {
    if (!file.src) state.module.files[file.id] = value;
}

/**
 * Re-fetches a remote file from its source URL and shows a toast with the result.
 *
 * @param file The remote file to refresh.
 */
async function refreshFile(file: IFile) {
    try {
        await state.refreshModuleFile(file.id);
        toast.success({ title: t('TOAST.MODULE.REFRESHED'), description: file.name });
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        toast.error({ title: t('TOAST.MODULE.REFRESH_FAILED'), description: message });
    }
}

async function copyToClipboard(text: string) {
    try {
        await copy(text);
        toast.success({ title: t('TOAST.COPY.SUCCEEDED'), description: text });
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        toast.error({ title: t('TOAST.COPY.FAILED'), description: message });
    }
}
</script>

<template>
    <div class="flex h-full min-h-0 w-full flex-col overflow-hidden p-2">
        <ResizablePanelGroup
            v-if="files.length"
            direction="vertical"
            class="min-h-0 w-full grow overflow-hidden"
        >
            <template v-for="(file, index) in files" :key="file.id">
                <ResizablePanel
                    v-slot="{ isCollapsed, collapse, expand }"
                    :id="`module-file-panel-${file.id}`"
                    :order="index"
                    :min-size="MIN_PX + 10"
                    :collapsible="true"
                    :collapsed-size="MIN_PX"
                    size-unit="px"
                    class="min-h-0"
                >
                    <div class="flex h-full min-h-0 flex-col overflow-hidden rounded-md border">
                        <div
                            class="bg-muted/40 flex cursor-grab flex-row items-center gap-1.5 rounded-t-md border-b px-2 py-1 select-none active:cursor-grabbing"
                            :class="{ 'opacity-50': draggingId === file.id }"
                            draggable="true"
                            @dragstart="(e) => onHeaderDragStart(e, file.id)"
                            @dragover="(e) => onHeaderDragOver(e, file.id)"
                            @dragend="onHeaderDragEnd"
                        >
                            <GripVerticalIcon
                                :size="14"
                                class="text-muted-foreground cursor-grab active:cursor-grabbing"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                class="hover:bg-secondary h-6 w-6"
                                :title="isCollapsed ? t('MODULES.EXPAND') : t('MODULES.COLLAPSE')"
                                @click.stop="isCollapsed ? expand() : collapse()"
                                :disabled="files.length === 1"
                            >
                                <ChevronRightIcon v-if="isCollapsed" :size="14" />
                                <ChevronDownIcon v-else :size="14" />
                            </Button>
                            <span
                                :class="
                                    cn(
                                        'flex h-4.5 items-center rounded px-1.5 text-[10px] font-semibold tracking-wide uppercase',
                                        isCss(file.type)
                                            ? 'bg-accent/20 text-accent'
                                            : 'bg-success/15 text-success',
                                    )
                                "
                            >
                                {{ isCss(file.type) ? 'CSS' : 'JS' }}
                            </span>
                            <span class="mr-auto truncate text-xs" :class="{ italic: file.src }">
                                {{ displayName(file) }}
                            </span>
                            <template v-if="file.src">
                                <TooltipWrapper
                                    :content="t('MODULES.REMOTE_LINK_COPY', { url: file.src })"
                                    :content-props="{ side: 'bottom' }"
                                    class="wrap-anywhere"
                                >
                                    <div
                                        @click.stop="() => copyToClipboard(file.src!)"
                                        class="flex cursor-pointer flex-row items-center gap-0.5"
                                    >
                                        <Link2Icon
                                            :size="14"
                                            class="text-muted-foreground shrink-0"
                                        />
                                        <div
                                            class="text-muted-foreground max-w-50 truncate text-xs"
                                        >
                                            {{ file.src }}
                                        </div>
                                    </div>
                                </TooltipWrapper>
                                <TooltipWrapper
                                    :content="t('MODULES.REFRESH')"
                                    :content-props="{ side: 'bottom' }"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="hover:bg-secondary h-6 w-6"
                                        @click.stop="() => refreshFile(file)"
                                    >
                                        <RefreshCwIcon :size="14" />
                                    </Button>
                                </TooltipWrapper>
                            </template>
                            <TooltipWrapper
                                :content="t('MODULES.REMOVE_FILE')"
                                :content-props="{ side: 'bottom' }"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    class="hover:bg-destructive/10 hover:text-destructive h-6 w-6"
                                    @click.stop="() => removeFile(file.id)"
                                >
                                    <Trash2Icon :size="14" />
                                </Button>
                            </TooltipWrapper>
                        </div>
                        <div v-show="!isCollapsed" class="relative min-h-0 flex-1 overflow-hidden">
                            <CodeEditor
                                :language="editorLanguage(file.type)"
                                :model-value="file.src ? file.content : state.module.files[file.id]"
                                @update:model-value="(value: string) => onModelUpdate(file, value)"
                                :readonly="Boolean(file.src)"
                                :actions-bar="!file.src"
                                :placeholder="placeholder(file.type)"
                                :settings="false"
                                :preview="false"
                                :resizing="draggingHandle"
                            />
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle
                    v-if="index < files.length - 1"
                    class="bg-primary data-[state=drag]:bg-accent hover:bg-accent/50 mx-auto h-1! w-[calc(100%-32px)]! shrink-0! cursor-row-resize rounded transition-colors after:content-none"
                    @dragging="(isDragging) => (draggingHandle = isDragging)"
                />
            </template>
        </ResizablePanelGroup>
        <div
            v-else
            class="border-border/60 text-muted-foreground flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed"
        >
            <FileCode2Icon class="size-10" />
            <p class="text-sm">{{ t('MODULES.EMPTY') }}</p>
        </div>
    </div>
</template>
