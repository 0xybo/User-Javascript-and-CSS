<script setup lang="ts">
import { computed } from '#imports';
import TooltipWrapper from '@/components/TooltipWrapper.vue';
import Button from '@/components/ui/button/Button.vue';
import InputGroup from '@/components/ui/input-group/InputGroup.vue';
import InputGroupAddon from '@/components/ui/input-group/InputGroupAddon.vue';
import InputGroupInput from '@/components/ui/input-group/InputGroupInput.vue';
import Label from '@/components/ui/label/Label.vue';
import useState from '@/composables/options/useState';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation.ts';
import { FileType } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind';
import { FileCode2Icon, FileType2Icon, RefreshCwIcon, SaveIcon } from 'lucide-vue-next';
import ModuleImport from './ModuleImport.vue';
import ModuleMoreMenu from './ModuleMoreMenu.vue';

const t = useTranslation();
const state = useState();
const { push } = useToast();

/** Whether the current module contains at least one imported (remote) file. */
const hasRemoteFiles = computed(() => state.module.item.files.some((f) => f.src));

/**
 * Handles the click event on the save button. Saves the current module draft and displays a toast
 * notification indicating whether the module was created or updated.
 */
function onSaveButtonClick() {
    const wasNew = state.module.isNew;
    state.saveModuleDraft();
    push({
        title: t(wasNew ? 'TOAST.MODULE_CREATED' : 'TOAST.MODULE_UPDATED'),
        variant: 'success',
    });
}

/**
 * Adds a new file of the given type to the current module draft.
 *
 * @param type The type of file to add (JavaScript or CSS).
 */
function addFile(type: FileType) {
    state.addModuleFile(type);
}

/**
 * Re-fetches every remote file of the module and shows a toast summarising the result.
 */
async function onRefreshAllClick() {
    const { failed } = await state.refreshAllModuleFiles();
    push({
        title: t(failed === 0 ? 'TOAST.MODULE_REFRESHED' : 'TOAST.MODULE_REFRESH_FAILED'),
        variant: failed === 0 ? 'success' : 'error',
    });
}
</script>

<template>
    <div class="flex w-full flex-col gap-1 border-b p-1">
        <div class="flex w-full flex-row gap-1">
            <InputGroup class="border-primary h-min flex-1">
                <InputGroupAddon class="absolute top-0 pt-1! pb-0 pl-2">
                    <Label class="text-muted p-0 text-xs">
                        {{ t('MODULES.NAME') }}
                    </Label>
                </InputGroupAddon>
                <InputGroupInput
                    :placeholder="t('MODULES.NAME_EXAMPLE')"
                    class="h-11 pt-6 pb-2!"
                    v-model="state.module.item.name"
                />
            </InputGroup>
            <Button
                @click="onSaveButtonClick"
                :disabled="!state.moduleUnsaved"
                variant="ghost"
                :class="
                    cn('bg-accent text-accent-foreground h-full', {
                        'bg-primary text-primary-foreground': !state.moduleUnsaved,
                    })
                "
            >
                <SaveIcon class="size-5" />
                {{ t('COMMON.SAVE') }}
            </Button>
            <ModuleMoreMenu />
        </div>
        <div class="flex flex-row items-center gap-1 px-1 pb-1">
            <TooltipWrapper :content="t('MODULES.ADD_JS')">
                <Button
                    variant="outline"
                    size="sm"
                    class="gap-1 text-xs"
                    @click="() => addFile(FileType.Javascript)"
                >
                    <FileCode2Icon :size="14" />
                    {{ t('MODULES.ADD_JS') }}
                </Button>
            </TooltipWrapper>
            <TooltipWrapper :content="t('MODULES.ADD_CSS')">
                <Button
                    variant="outline"
                    size="sm"
                    class="gap-1 text-xs"
                    @click="() => addFile(FileType.Css)"
                >
                    <FileType2Icon :size="14" />
                    {{ t('MODULES.ADD_CSS') }}
                </Button>
            </TooltipWrapper>
            <span class="bg-border mx-1 h-5 w-px shrink-0" />
            <ModuleImport />
            <TooltipWrapper :content="t('MODULES.REFRESH_ALL')">
                <Button
                    variant="outline"
                    size="sm"
                    class="gap-1 text-xs"
                    :disabled="!hasRemoteFiles"
                    @click="onRefreshAllClick"
                >
                    <RefreshCwIcon :size="14" />
                    {{ t('MODULES.REFRESH') }}
                </Button>
            </TooltipWrapper>
        </div>
    </div>
</template>
