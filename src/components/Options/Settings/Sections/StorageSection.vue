<script setup lang="ts">
import { i18n } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Label from '@/components/ui/label/Label.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { useStorage } from '@/composables/useStorage';
import { DownloadIcon, Trash2Icon, UploadIcon } from 'lucide-vue-next';

const storage = useStorage();

function onExportJSON() {
    const data = JSON.stringify(storage.current, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-js-css-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

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
        } catch (err) {
            console.error('Import failed:', err);
        }
    };
    reader.readAsText(file);
}

async function onWipeData() {
    const confirmed = window.confirm(i18n.t('SETTINGS_WIPE_CONFIRM'));
    if (confirmed) {
        await storage.reset();
    }
}
</script>

<template>
    <section id="settings-storage" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ i18n.t('SETTINGS_STORAGE') }}
        </h2>
        <Separator />
        <div class="flex flex-wrap items-center gap-3">
            <Button variant="outline" @click="onExportJSON">
                <DownloadIcon class="mr-2 h-4 w-4" />
                {{ i18n.t('SETTINGS_EXPORT') }}
            </Button>
            <Label class="cursor-pointer">
                <Button variant="outline" as="span">
                    <UploadIcon class="mr-2 h-4 w-4" />
                    {{ i18n.t('SETTINGS_IMPORT') }}
                </Button>
                <input
                    type="file"
                    accept=".json"
                    class="hidden"
                    @change="
                        (e) =>
                            onImportJSON(
                                (e.target as HTMLInputElement).files?.[0],
                            )
                    "
                />
            </Label>
            <Button
                variant="outline"
                class="hover:bg-destructive hover:text-destructive-foreground border-destructive text-destructive"
                @click="onWipeData"
            >
                <Trash2Icon class="mr-2 h-4 w-4" />
                {{ i18n.t('SETTINGS_WIPE_DATA') }}
            </Button>
        </div>
    </section>
</template>
