<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import Label from '@/components/ui/label/Label.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation';
import { clean } from '@/lib/storage/utils';
import { DownloadIcon, Trash2Icon, UploadIcon } from 'lucide-vue-next';

const t = useTranslation();
const storage = useStorage();
const { push } = useToast();

/**
 * Exports the current storage settings, rules, and modules as a JSON file for download.
 * The exported file is named with the current date in ISO format.
 */
function onExportJSON() {
    const data = JSON.stringify(clean(storage.current), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-js-css-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push({ title: t('TOAST.SETTINGS_EXPORTED'), variant: 'success' });
}

/**
 * Imports storage settings, rules, and modules from a selected JSON file.
 * The imported data replaces the current storage state and is saved.
 *
 * @param file - The JSON file selected by the user for import.
 */
function onImportJSON(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target?.result as string);
            Object.assign(storage.settings, data.settings);
            storage.rules.splice(0, storage.rules.length, ...(data.rules || []));
            storage.modules.splice(0, storage.modules.length, ...(data.modules || []));
            await storage.save();
            push({ title: t('TOAST.SETTINGS_IMPORTED'), variant: 'success' });
        } catch (err) {
            console.error('Import failed:', err);
            push({ title: t('TOAST.SETTINGS_IMPORT_ERROR'), variant: 'error' });
        }
    };
    reader.readAsText(file);
}

/**
 * Wipes all user data from storage after confirming with the user.
 * This action resets the storage to its default state and displays a toast notification.
 */
async function onWipeData() {
    const confirmed = window.confirm(t('SETTINGS.WIPE_CONFIRM'));
    if (!confirmed) return;
    await storage.reset();
    push({ title: t('TOAST.SETTINGS_RESET'), variant: 'info' });
}
</script>

<template>
    <section id="settings-storage" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ t('SETTINGS.STORAGE') }}
        </h2>
        <Separator />
        <div class="flex flex-wrap items-center gap-3">
            <Button variant="outline" @click="onExportJSON">
                <DownloadIcon class="mr-2 h-4 w-4" />
                {{ t('SETTINGS.EXPORT') }}
            </Button>
            <Label class="cursor-pointer">
                <Button variant="outline" as="span">
                    <UploadIcon class="mr-2 h-4 w-4" />
                    {{ t('SETTINGS.IMPORT') }}
                </Button>
                <input
                    type="file"
                    accept=".json"
                    class="hidden"
                    @change="(e) => onImportJSON((e.target as HTMLInputElement).files?.[0])"
                />
            </Label>
            <Button
                variant="outline"
                class="hover:bg-destructive hover:text-destructive-foreground border-destructive text-destructive"
                @click="onWipeData"
            >
                <Trash2Icon class="mr-2 h-4 w-4" />
                {{ t('SETTINGS.WIPE_DATA') }}
            </Button>
        </div>
    </section>
</template>
