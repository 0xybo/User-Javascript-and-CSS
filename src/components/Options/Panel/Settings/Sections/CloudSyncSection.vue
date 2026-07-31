<script setup lang="ts">
import { i18n } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Label from '@/components/ui/label/Label.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useStorage } from '@/composables/useStorage';
import { CloudDownloadIcon, CloudUploadIcon } from 'lucide-vue-next';

const storage = useStorage();

async function onUploadSync() {
    try {
        await storage.upload(true);
    } catch (e) {
        console.error('Sync upload failed:', e);
    }
}

async function onDownloadSync() {
    try {
        await storage.download(true);
    } catch (e) {
        console.error('Sync download failed:', e);
    }
}
</script>

<template>
    <section id="settings-cloud-sync" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ i18n.t('SETTINGS_CLOUD_SYNC') }}
        </h2>
        <Separator />
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <Label>{{ i18n.t('SETTINGS_SYNC_ENABLED') }}</Label>
                <Switch
                    :checked="storage.settings.syncEnabled"
                    @update:checked="
                        (v: boolean) => (storage.settings.syncEnabled = v)
                    "
                />
            </div>
            <div class="flex flex-wrap gap-3">
                <Button variant="outline" @click="onUploadSync">
                    <CloudUploadIcon class="mr-2 h-4 w-4" />
                    {{ i18n.t('SETTINGS_SYNC_UPLOAD') }}
                </Button>
                <Button variant="outline" @click="onDownloadSync">
                    <CloudDownloadIcon class="mr-2 h-4 w-4" />
                    {{ i18n.t('SETTINGS_SYNC_DOWNLOAD') }}
                </Button>
            </div>
        </div>
    </section>
</template>
