<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Dialog from '@/components/ui/dialog/Dialog.vue';
import DialogClose from '@/components/ui/dialog/DialogClose.vue';
import DialogContent from '@/components/ui/dialog/DialogContent.vue';
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue';
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import DialogTrigger from '@/components/ui/dialog/DialogTrigger.vue';
import Input from '@/components/ui/input/Input.vue';
import { useDialog } from '@/composables/options/useDialog';
import useState from '@/composables/options/useState';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation';
import { fetchFile, resolveSource, type ImportMode } from '@/lib/module-import';
import { ItemType } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind';
import { useDebounceFn } from '@vueuse/core';
import { CloudDownload, EyeIcon, ImportIcon, Loader2 } from 'lucide-vue-next';

const t = useTranslation();
const state = useState();
const storage = useStorage();
const dialog = useDialog();
const toast = useToast();
const input = useTemplateRef<HTMLInputElement>('input');

/** The visual presentation of the trigger button: as a toolbar item or a sidebar link. */
const props = withDefaults(
    defineProps<{
        /** How the trigger button is rendered. */
        trigger?: 'toolbar' | 'link';
        /** Whether the import should always create a new module named from the source. */
        quick?: boolean;
    }>(),
    { trigger: 'toolbar', quick: false },
);

/** Whether the import dialog is open. */
const isOpen = ref<boolean>(false);
/** How the entered source is interpreted. */
const mode = ref<ImportMode>('package');
/** The URL or module name the user wants to import. */
const source = ref<string>('');
/** Whether an import request is currently running. */
const importing = ref<boolean>(false);
/** The state of the live preview box. */
const preview = ref<{
    status: 'idle' | 'loading' | 'ready' | 'error';
    text?: string;
    error?: string;
}>({
    status: 'idle',
});

/**
 * The placeholder text of the source input, depending on the selected mode.
 */
const inputPlaceholder = computed(() =>
    mode.value === 'url' ? t('MODULES.URL_PLACEHOLDER') : t('MODULES.PACKAGE_PLACEHOLDER'),
);

/**
 * Whether the import button is enabled: a source must be present, its preview must have resolved,
 * and no import may already be running.
 */
const canImport = computed(
    () => Boolean(source.value.trim()) && preview.value.status === 'ready' && !importing.value,
);

/**
 * Fetches the source and fills the preview box with its content. Outcomes: 'loading' while
 * fetching, 'ready' with the (truncated) content on success, 'error' with a message on failure.
 */
async function runPreview() {
    const value = source.value.trim();
    if (!value) {
        preview.value = { status: 'idle' };
        return;
    }

    preview.value = { status: 'loading' };
    try {
        const fetched = await fetchFile(resolveSource(value, mode.value));
        preview.value = { status: 'ready', text: fetched.text.slice(0, 20000) };
    } catch (e) {
        preview.value = { status: 'error', error: e instanceof Error ? e.message : String(e) };
    }
}

/** Previews the entered source, debounced while typing. */
const debouncedPreview = useDebounceFn(runPreview, 600);

watch(isOpen, (open) => {
    if (!open) return;
    source.value = '';
    preview.value = { status: 'idle' };
    nextTick(() => input.value?.focus?.());
});

watch(source, debouncedPreview);
watch(mode, debouncedPreview);

/**
 * Imports the entered source: in quick mode a new module named from the source is created
 * (after discarding any pending "New Module" draft, with a confirmation), otherwise the file is
 * added to the current module. On success a toast is shown and the dialog closes.
 */
async function doImport() {
    const value = source.value.trim();
    if (!value || importing.value) return;
    importing.value = true;
    try {
        let file;
        if (props.quick) {
            const draft = storage.getDraftNewFromType(ItemType.Module);
            if (draft) {
                let proceed = false;
                await dialog.open({
                    title: t('DIALOG.CONFIRM.CONFIRM'),
                    message: t('DRAFT.ALREADY_EXISTS'),
                    actions: [
                        { label: t('DIALOG.CONFIRM.CANCEL'), callback: () => {} },
                        {
                            label: t('DRAFT.OPEN_EXISTING'),
                            callback: () => state.switchDraft(draft),
                        },
                        {
                            label: t('DIALOG.CONFIRM.CONFIRM'),
                            callback: () => {
                                storage.discardDraft(draft);
                                proceed = true;
                            },
                        },
                    ],
                });
                if (!proceed) return;
            }
            file = await state.quickImportModule(value, mode.value);
        } else {
            file = await state.importModuleFile(value, mode.value);
        }
        toast.success({ title: t('TOAST.MODULE.IMPORTED'), description: file.name });
        isOpen.value = false;
        source.value = '';
        preview.value = { status: 'idle' };
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        toast.error({ title: t('TOAST.MODULE.IMPORT_FAILED'), description: message });
    } finally {
        importing.value = false;
    }
}

/**
 * Handles the Enter key in the source input: imports directly when the preview is already
 * resolved, otherwise previews first and imports if that succeeds.
 */
async function onEnter() {
    if (previewStatus() === 'ready') {
        await doImport();
        return;
    }
    await runPreview();
    if (previewStatus() === 'ready') await doImport();
}

/** Returns the current preview status, read lazily so TypeScript does not over-narrow it. */
function previewStatus(): 'idle' | 'loading' | 'ready' | 'error' {
    return preview.value.status;
}

/**
 * Returns the class applied to one of the two mode pills, marking the active one.
 *
 * @param pill The mode the pill represents.
 * @returns The pill classes for the given mode.
 */
function pillClass(pill: 'package' | 'url'): string {
    return cn('flex-1 cursor-pointer rounded px-3 py-1 text-xs transition-colors select-none', {
        'bg-accent text-accent-foreground': mode.value === pill,
        'text-muted-foreground hover:text-foreground': mode.value !== pill,
    });
}
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <Button v-if="trigger === 'toolbar'" variant="outline" size="sm" class="gap-1 text-xs">
                <ImportIcon :size="14" />
                {{ t('MODULES.IMPORTS') }}
            </Button>
            <Button v-else class="text-foreground flex h-min flex-row gap-1 p-0" variant="link">
                <CloudDownload :size="14" />
                {{ t('MODULES.QUICK_IMPORT') }}
            </Button>
        </DialogTrigger>

        <DialogContent class="flex flex-col sm:max-w-lg">
            <DialogHeader>
                <DialogTitle class="text-sm">
                    {{ t('MODULES.IMPORT_TITLE') }}
                </DialogTitle>
            </DialogHeader>

            <div class="flex flex-col gap-3">
                <div class="bg-muted/40 flex flex-row gap-0.5 rounded-md border p-0.5">
                    <button
                        type="button"
                        class="h-8"
                        :class="pillClass('package')"
                        :aria-pressed="mode === 'package'"
                        @click="mode = 'package'"
                    >
                        {{ t('MODULES.IMPORT_PACKAGE') }}
                    </button>
                    <button
                        type="button"
                        class="h-8"
                        :class="pillClass('url')"
                        :aria-pressed="mode === 'url'"
                        @click="mode = 'url'"
                    >
                        {{ t('MODULES.IMPORT_URL') }}
                    </button>
                </div>

                <Input
                    ref="input"
                    v-model="source"
                    type="text"
                    :placeholder="inputPlaceholder"
                    class="h-9 text-xs"
                    @keyup.enter="onEnter"
                />

                <div class="flex flex-col gap-1">
                    <span class="text-muted-foreground flex items-center gap-1 text-xs">
                        <EyeIcon :size="13" />
                        {{ t('MODULES.IMPORT_PREVIEW') }}
                    </span>
                    <div
                        class="bg-muted/40 border-border/60 max-h-44 min-h-28 overflow-auto rounded-md border p-2"
                    >
                        <div
                            v-if="preview.status === 'idle'"
                            class="text-muted-foreground flex h-24 items-center justify-center text-xs"
                        >
                            {{ t('MODULES.IMPORT_EMPTY') }}
                        </div>
                        <div
                            v-else-if="preview.status === 'loading'"
                            class="text-muted-foreground flex h-24 items-center justify-center"
                        >
                            <Loader2 class="size-5 animate-spin" />
                        </div>
                        <div
                            v-else-if="preview.status === 'error'"
                            class="text-destructive flex h-24 items-center justify-center text-xs"
                        >
                            {{ preview.error }}
                        </div>
                        <pre
                            v-else
                            class="font-mono text-[10px] leading-relaxed wrap-break-word whitespace-pre-wrap"
                            >{{ preview.text }}</pre>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <DialogClose as-child>
                    <Button variant="outline" size="sm">
                        {{ t('COMMON.CANCEL') }}
                    </Button>
                </DialogClose>
                <Button
                    size="sm"
                    class="bg-accent text-accent-foreground gap-1"
                    :disabled="!canImport"
                    @click="doImport"
                >
                    <Loader2 v-if="importing" class="size-3.5 animate-spin" />
                    <ImportIcon v-else :size="14" />
                    {{ t('MODULES.IMPORT') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
