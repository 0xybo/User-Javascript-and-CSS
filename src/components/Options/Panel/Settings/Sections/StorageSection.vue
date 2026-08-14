<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import Label from '@/components/ui/label/Label.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation';
import { detectLegacyStorage, migrateLegacyStorage } from '@/lib/storage/migrate';
import { browser } from '#imports';
import { DownloadIcon, HistoryIcon, Trash2Icon, UploadIcon } from 'lucide-vue-next';

const t = useTranslation();
const storage = useStorage();
const { push } = useToast();

/**
 * Exports the current storage settings, rules, and modules as a JSON file for download.
 * The exported file is named with the current date in ISO format.
 */
function onExportJSON() {
    const blob = new Blob([storage.getRaw()], { type: 'application/json' });
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
 * Imports the data that the original v3.1.2 extension left in `browser.storage.local`. Only
 * works when the current extension shares the old extension id (build with
 * `UJC_RESTORE_ORIGINAL_KEY=1`). Replaces all current data after confirmation.
 */
async function onImportLegacy() {
    try {
        const raw = (await browser.storage.local.get()) as Record<string, unknown>;
        if (!detectLegacyStorage(raw)) {
            push({ title: t('TOAST.SETTINGS_LEGACY_NOT_FOUND'), variant: 'info' });
            return;
        }
        const confirmed = window.confirm(t('SETTINGS.IMPORT_LEGACY_CONFIRM'));
        if (!confirmed) return;
        await storage.importData(migrateLegacyStorage(raw));
        push({ title: t('TOAST.SETTINGS_LEGACY_IMPORTED'), variant: 'success' });
    } catch (err) {
        console.error('Legacy import failed:', err);
        push({ title: t('TOAST.SETTINGS_LEGACY_IMPORT_ERROR'), variant: 'error' });
    }
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
            <div class="flex flex-col gap-1">
                <Button variant="outline" @click="onExportJSON">
                    <DownloadIcon class="mr-2 h-4 w-4" />
                    {{ t('SETTINGS.EXPORT') }}
                </Button>
                <!-- <p class="text-muted-foreground text-xs">
                    {{ t('SETTINGS.EXPORT_DESCRIPTION') }}
                </p> -->
            </div>
            <div class="flex flex-col gap-1">
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
                <!-- <p class="text-muted-foreground text-xs">
                    {{ t('SETTINGS.IMPORT_DESCRIPTION') }}
                </p> -->
            </div>
            <div class="flex flex-col gap-1">
                <Button variant="outline" @click="onImportLegacy">
                    <HistoryIcon class="mr-2 h-4 w-4" />
                    {{ t('SETTINGS.IMPORT_LEGACY') }}
                </Button>
                <!-- <p class="text-muted-foreground text-xs">
                    {{ t('SETTINGS.IMPORT_LEGACY_DESCRIPTION') }}
                </p> -->
            </div>
            <div class="flex flex-col gap-1">
                <Button
                    variant="outline"
                    class="hover:bg-destructive hover:text-destructive-foreground border-destructive text-destructive"
                    @click="onWipeData"
                >
                    <Trash2Icon class="mr-2 h-4 w-4" />
                    {{ t('SETTINGS.WIPE_DATA') }}
                </Button>
                <!-- <p class="text-muted-foreground text-xs">
                    {{ t('SETTINGS.WIPE_DATA_DESCRIPTION') }}
                </p> -->
            </div>
        </div>

        <p class="text-muted-foreground text-xs">
            <ul class="list-disc pl-5">
                <li>{{ t('SETTINGS.EXPORT') }}: {{ t('SETTINGS.EXPORT_DESCRIPTION') }}</li>
                <li>{{ t('SETTINGS.IMPORT') }}: {{ t('SETTINGS.IMPORT_DESCRIPTION') }}</li>
                <li>{{ t('SETTINGS.WIPE_DATA') }}: {{ t('SETTINGS.WIPE_DATA_DESCRIPTION') }}</li>
                <li>{{ t('SETTINGS.IMPORT_LEGACY') }}: {{ t('SETTINGS.IMPORT_LEGACY_DESCRIPTION') }}</li>
            </ul>
        </p>
    </section>
</template>
