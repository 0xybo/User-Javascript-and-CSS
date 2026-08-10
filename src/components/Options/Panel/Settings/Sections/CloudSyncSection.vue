<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import Label from '@/components/ui/label/Label.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation';
import { CloudDownloadIcon, CloudUploadIcon } from 'lucide-vue-next';

const t = useTranslation();
const storage = useStorage();
const { push } = useToast();

async function onUploadSync() {
    try {
        await storage.upload(true);
        push({ title: t('TOAST.SYNC_UPLOAD_SUCCESS'), variant: 'success' });
    } catch (e) {
        console.error('Sync upload failed:', e);
        push({ title: t('TOAST.SYNC_UPLOAD_ERROR'), variant: 'error' });
    }
}

async function onDownloadSync() {
    try {
        await storage.download(true);
        push({ title: t('TOAST.SYNC_DOWNLOAD_SUCCESS'), variant: 'success' });
    } catch (e) {
        console.error('Sync download failed:', e);
        push({ title: t('TOAST.SYNC_DOWNLOAD_ERROR'), variant: 'error' });
    }
}
</script>

<template>
    <section id="settings-cloud-sync" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ t('SETTINGS.CLOUD_SYNC') }}
        </h2>
        <Separator />
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <Label>{{ t('SETTINGS.SYNC_ENABLED') }}</Label>
                <Switch
                    :checked="storage.settings.syncEnabled"
                    @update:checked="(v: boolean) => (storage.settings.syncEnabled = v)"
                />
            </div>
            <div class="flex flex-wrap gap-3">
                <Button variant="outline" @click="onUploadSync">
                    <CloudUploadIcon class="mr-2 h-4 w-4" />
                    {{ t('SETTINGS.SYNC_UPLOAD') }}
                </Button>
                <Button variant="outline" @click="onDownloadSync">
                    <CloudDownloadIcon class="mr-2 h-4 w-4" />
                    {{ t('SETTINGS.SYNC_DOWNLOAD') }}
                </Button>
            </div>
        </div>
    </section>
</template>
