<script setup lang="ts">
import { computed, ref } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useDialog } from '@/composables/options/useDialog';
import useState from '@/composables/options/useState';
import { useDraft } from '@/composables/useDraft';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation.ts';
import { IModule, ItemType } from '@/lib/storage/types';
import { PackagePlus } from 'lucide-vue-next';
import ModuleImport from '@/components/Options/Panel/Modules/ModuleImport.vue';
import ModuleList from './ModuleList.vue';

const t = useTranslation();
const state = useState();
const storage = useStorage();
const dialog = useDialog();
const searchQuery = ref<string>('');

const modules = computed(() => {
    return Array.from(storage.modules).filter((module) => {
        if (!searchQuery.value) return true;
        const name = module.name?.toLowerCase() || '';
        const pkg = module.package?.toLowerCase() || '';
        const query = searchQuery.value.toLowerCase();
        return name.includes(query) || pkg.includes(query);
    });
});

/**
 * Handles the click event for creating a new module. If a draft for a new module already exists, it
 * prompts the user to either open the existing draft or discard it and create a new one.
 */
function onNewModuleButtonClick() {
    const draft = storage.getDraftNewFromType(ItemType.Module);
    if (draft) {
        dialog.open({
            title: t('DIALOG.CONFIRM.CONFIRM'),
            message: t('DRAFT.ALREADY_EXISTS'),
            actions: [
                { label: t('DIALOG.CONFIRM.CANCEL'), callback: () => {} },
                { label: t('DRAFT.OPEN_EXISTING'), callback: () => state.switchDraft(draft) },
                {
                    label: t('DIALOG.CONFIRM.CONFIRM'),
                    callback: () => {
                        storage.discardDraft(draft);
                        state.switchDraft(storage.createDraftFromType(ItemType.Module));
                    },
                },
            ],
        });
    } else state.switchDraft(storage.createDraftFromType(ItemType.Module));
}

/**
 * Handles the event when a module is opened from the module list. It switches the current draft to
 * the selected module.
 *
 * @param module The module that was opened from the module list.
 */
function onModuleListOpen(module: IModule) {
    state.switchDraft(useDraft(module));
}
</script>

<template>
    <div class="flex h-full flex-col overflow-y-auto">
        <div>
            <div class="flex min-h-8 flex-row justify-between px-4 py-2 text-xs select-none">
                <div class="flex items-center tracking-widest uppercase">
                    {{ t('COMMON.MODULES') }} ({{ modules.length }})
                </div>
                <div class="flex flex-col items-end gap-0.5">
                    <Button
                        class="text-foreground flex h-min flex-row gap-1 p-0"
                        variant="link"
                        @click="onNewModuleButtonClick"
                    >
                        <PackagePlus :size="16" />
                        {{ t('COMMON.NEW_MODULE') }}
                    </Button>
                    <ModuleImport :trigger="'link'" :quick="true" />
                </div>
            </div>
            <div class="flex flex-row gap-2 border-b px-4 py-3">
                <Input
                    type="text"
                    :placeholder="t('COMMON.FIND')"
                    class="border-secondary"
                    v-model="searchQuery"
                />
            </div>
        </div>
        <div v-if="modules.length" class="flex flex-1 flex-col overflow-y-auto">
            <ModuleList
                :modules="modules"
                @open="onModuleListOpen"
                :opened-module-id="state.module.item.id"
            />
        </div>
        <div v-else class="text-muted flex flex-1 items-center justify-center text-sm">
            {{ t('MODULES.EMPTY') }}
        </div>
    </div>
</template>

<style lang="css" scoped></style>
