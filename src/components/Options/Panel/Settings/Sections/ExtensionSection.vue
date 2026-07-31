<script setup lang="ts">
import { i18n } from '#imports';
import Label from '@/components/ui/label/Label.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useStorage } from '@/composables/useStorage';
import { SORT } from '@/lib/options/sortRules';
import { SortBy } from '@/lib/storage/types';

const storage = useStorage();

const SORT_OPTIONS = Object.entries(SORT).map(([key, val]) => ({
    value: key as SortBy,
    label: val.label,
}));
</script>

<template>
    <section id="settings-extension" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ i18n.t('SETTINGS_EXTENSION') }}
        </h2>
        <Separator />
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <Label>{{ i18n.t('SETTINGS_BADGE_COUNT') }}</Label>
                    <p class="text-muted-foreground text-xs">
                        {{ i18n.t('SETTINGS_BADGE_COUNT_DESCRIPTION') }}
                    </p>
                </div>
                <Switch
                    :checked="storage.settings.badgeCount"
                    @update:checked="(v: boolean) => (storage.settings.badgeCount = v)"
                />
            </div>
            <div class="flex items-center justify-between">
                <Label>{{ i18n.t('SETTINGS_DEFAULT_SORT') }}</Label>
                <Select
                    :model-value="storage.settings.sortBy"
                    @update:model-value="(v: unknown) => (storage.settings.sortBy = v as SortBy)"
                >
                    <SelectTrigger class="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div class="flex items-center justify-between">
                <div>
                    <Label>{{ i18n.t('SETTINGS_LANGUAGE') }}</Label>
                </div>
                <Select
                    :model-value="storage.settings.language"
                    @update:model-value="
                        (v: unknown) => (storage.settings.language = v as 'en' | 'fr')
                    "
                >
                    <SelectTrigger class="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div class="flex items-center justify-between">
                <div>
                    <Label>{{ i18n.t('SETTINGS_DEV_MODE') }}</Label>
                </div>
                <Switch
                    :checked="storage.settings.autoEnableDevMode"
                    @update:checked="(v: boolean) => (storage.settings.autoEnableDevMode = v)"
                />
            </div>
        </div>
    </section>
</template>
