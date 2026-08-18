<script setup lang="ts">
import { computed, onMounted, ref } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Label from '@/components/ui/label/Label.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useDialog } from '@/composables/options/useDialog';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast';
import useTranslation from '@/composables/useTranslation';
import { RemoteSettingsInfo, SyncFrequency, SyncMethod } from '@/lib/storage/types';
import { CloudDownloadIcon, CloudUploadIcon } from 'lucide-vue-next';

const t = useTranslation();
const storage = useStorage();
const { push } = useToast();
const dialog = useDialog();

const NO_EMITTER = '—';
const remoteInfo = ref<RemoteSettingsInfo | null>(null);

const FREQUENCY_OPTIONS = [
    { value: SyncFrequency.Hourly, label: t('SETTINGS.SYNC_FREQUENCY.OPTIONS.HOURLY') },
    { value: SyncFrequency.Daily, label: t('SETTINGS.SYNC_FREQUENCY.OPTIONS.DAILY') },
    { value: SyncFrequency.Weekly, label: t('SETTINGS.SYNC_FREQUENCY.OPTIONS.WEEKLY') },
];

const METHOD_OPTIONS = [
    { value: SyncMethod.Push, label: t('SETTINGS.SYNC_METHOD.OPTIONS.PUSH') },
    { value: SyncMethod.Pull, label: t('SETTINGS.SYNC_METHOD.OPTIONS.PULL') },
    { value: SyncMethod.Both, label: t('SETTINGS.SYNC_METHOD.OPTIONS.BOTH') },
];

/**
 * Formats a timestamp as a localized date and time.
 *
 * @param timestamp The timestamp to format.
 * @returns The formatted date and time using the current extension locale.
 */
function formatDateTime(timestamp: number): string {
    return new Intl.DateTimeFormat(storage.settings.language, {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(timestamp);
}

/**
 * Fetches the current remote storage information and stores it for display.
 */
async function refreshRemote() {
    if (storage.settings.syncEnabled) {
        remoteInfo.value = await storage.getRemoteInfo();
    } else {
        remoteInfo.value = null;
    }
}

/**
 * The date of the last successful synchronization with the cloud, if any.
 */
const lastSynced = computed(() => {
    if (!remoteInfo.value?.updated) return t('SETTINGS.SYNC_NEVER');
    return formatDateTime(remoteInfo.value.updated);
});

/**
 * Builds the confirmation message shown before uploading or downloading the settings from the
 * cloud.
 *
 * @param kind Whether the user wants to upload or download the settings.
 * @returns The full confirmation message with the local and remote update information.
 */
function buildSyncMessage(kind: 'upload' | 'download'): string {
    const localUpdated = formatDateTime(storage.info.updated);
    const remoteUpdated = remoteInfo.value?.updated
        ? formatDateTime(remoteInfo.value.updated)
        : t('SETTINGS.SYNC_NEVER');

    return [
        kind === 'upload' ? t('DIALOG.SYNC.UPLOAD_MESSAGE') : t('DIALOG.SYNC.DOWNLOAD_MESSAGE'),
        t('DIALOG.SYNC.LOCAL_UPDATED', [localUpdated]),
        t('DIALOG.SYNC.LOCAL_EMITTER', [storage.info.emitter || NO_EMITTER]),
        t('DIALOG.SYNC.REMOTE_UPDATED', [remoteUpdated]),
        t('DIALOG.SYNC.REMOTE_EMITTER', [remoteInfo.value?.emitter || NO_EMITTER]),
    ].join('\n');
}

/**
 * Asks the user to confirm uploading or downloading the settings from the cloud.
 *
 * @param kind Whether the user wants to upload or download the settings.
 * @returns A boolean indicating whether the user confirmed the action.
 */
async function askConfirmation(kind: 'upload' | 'download'): Promise<boolean> {
    let confirmed = false;

    await dialog.open({
        title: t(kind === 'upload' ? 'DIALOG.SYNC.UPLOAD_TITLE' : 'DIALOG.SYNC.DOWNLOAD_TITLE'),
        message: buildSyncMessage(kind),
        actions: [
            { label: t('DIALOG.CONFIRM.CANCEL'), callback: () => {} },
            { label: t('DIALOG.CONFIRM.CONFIRM'), callback: () => (confirmed = true) },
        ],
    });

    return confirmed;
}

/**
 * Uploads the local settings to the cloud after asking the user for confirmation.
 */
async function onUploadSync() {
    await refreshRemote();
    const confirmed = await askConfirmation('upload');
    if (!confirmed) return;

    try {
        await storage.upload(true);
        await refreshRemote();
        push({ title: t('TOAST.SYNC_UPLOAD_SUCCESS'), variant: 'success' });
    } catch (e) {
        console.error('Sync upload failed:', e);
        push({ title: t('TOAST.SYNC_UPLOAD_ERROR'), variant: 'error' });
    }
}

/**
 * Downloads the settings from the cloud after asking the user for confirmation.
 */
async function onDownloadSync() {
    await refreshRemote();
    const confirmed = await askConfirmation('download');
    if (!confirmed) return;

    try {
        await storage.download(true);
        await refreshRemote();
        push({ title: t('TOAST.SYNC_DOWNLOAD_SUCCESS'), variant: 'success' });
    } catch (e) {
        console.error('Sync download failed:', e);
        push({ title: t('TOAST.SYNC_DOWNLOAD_ERROR'), variant: 'error' });
    }
}

onMounted(refreshRemote);
</script>

<template>
    <section id="settings-cloud-sync" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ t('SETTINGS.CLOUD_SYNC') }}
        </h2>
        <Separator />
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <Label>{{ t('SETTINGS.SYNC_ENABLED') }}</Label>
                    <p class="text-muted-foreground text-xs">
                        {{ t('SETTINGS.SYNC_ENABLED_DESCRIPTION') }}
                    </p>
                </div>
                <Switch
                    :model-value="storage.settings.syncEnabled"
                    @update:model-value="(v: boolean) => (storage.settings.syncEnabled = v)"
                />
            </div>

            <div v-if="storage.settings.syncEnabled" class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>{{ t('SETTINGS.SYNC_FREQUENCY.LABEL') }}</Label>
                        <p class="text-muted-foreground text-xs">
                            {{ t('SETTINGS.SYNC_FREQUENCY.DESCRIPTION') }}
                        </p>
                    </div>
                    <Select
                        :model-value="storage.settings.syncFrequency"
                        @update:model-value="
                            (v: unknown) => (storage.settings.syncFrequency = v as SyncFrequency)
                        "
                    >
                        <SelectTrigger class="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="opt in FREQUENCY_OPTIONS"
                                :key="opt.value"
                                :value="opt.value"
                            >
                                {{ opt.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <Label>{{ t('SETTINGS.SYNC_METHOD.LABEL') }}</Label>
                        <p class="text-muted-foreground text-xs">
                            {{ t('SETTINGS.SYNC_METHOD.DESCRIPTION') }}
                        </p>
                    </div>
                    <Select
                        :model-value="storage.settings.syncMethod"
                        @update:model-value="
                            (v: unknown) => (storage.settings.syncMethod = v as SyncMethod)
                        "
                    >
                        <SelectTrigger class="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="opt in METHOD_OPTIONS"
                                :key="opt.value"
                                :value="opt.value"
                            >
                                {{ opt.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <Label>{{ t('SETTINGS.SYNC_LAST_SYNCED') }}</Label>
                <span class="text-muted-foreground text-sm">{{ lastSynced }}</span>
            </div>

            <div class="flex flex-wrap gap-3">
                <div class="flex flex-col gap-1">
                    <Button variant="outline" @click="onUploadSync">
                        <CloudUploadIcon class="mr-2 h-4 w-4" />
                        {{ t('SETTINGS.SYNC_UPLOAD') }}
                    </Button>
                    <!-- <p class="text-muted-foreground text-xs">
                        {{ t('SETTINGS.SYNC_UPLOAD_DESCRIPTION') }}
                    </p> -->
                </div>
                <div class="flex flex-col gap-1">
                    <Button variant="outline" @click="onDownloadSync">
                        <CloudDownloadIcon class="mr-2 h-4 w-4" />
                        {{ t('SETTINGS.SYNC_DOWNLOAD') }}
                    </Button>
                    <!-- <p class="text-muted-foreground text-xs">
                        {{ t('SETTINGS.SYNC_DOWNLOAD_DESCRIPTION') }}
                    </p> -->
                </div>
            </div>

            <div class="text-muted-foreground text-xs">
                <ul class="list-disc pl-5">
                    <li>
                        {{ t('SETTINGS.SYNC_UPLOAD') }}: {{ t('SETTINGS.SYNC_UPLOAD_DESCRIPTION') }}
                    </li>
                    <li>
                        {{ t('SETTINGS.SYNC_DOWNLOAD') }}:
                        {{ t('SETTINGS.SYNC_DOWNLOAD_DESCRIPTION') }}
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
