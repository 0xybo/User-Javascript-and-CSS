<script setup lang="ts">
import Label from '@/components/ui/label/Label.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation';
import { useSort } from '@/lib/options/sortRules';
import { SortBy } from '@/lib/storage/types';
import { locales } from '@/locales';

const t = useTranslation();
const storage = useStorage();
const sort = useSort();

const SORT_OPTIONS = Object.entries(sort).map(([key, val]) => ({
    value: key as SortBy,
    label: val.label,
}));
</script>

<template>
    <section id="settings-extension" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ t('SETTINGS.EXTENSION') }}
        </h2>
        <Separator />
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <Label>{{ t('SETTINGS.BADGE_COUNT') }}</Label>
                    <p class="text-muted-foreground text-xs">
                        {{ t('SETTINGS.BADGE_COUNT_DESCRIPTION') }}
                    </p>
                </div>
                <Switch
                    :checked="storage.settings.badgeCount"
                    @update:checked="(v: boolean) => (storage.settings.badgeCount = v)"
                />
            </div>
            <div class="flex items-center justify-between">
                <Label>{{ t('SETTINGS.DEFAULT_SORT') }}</Label>
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
                    <Label>{{ t('SETTINGS.LANGUAGE') }}</Label>
                </div>
                <Select
                    :model-value="storage.settings.language"
                    @update:model-value="
                        (v: unknown) => (storage.settings.language = v as keyof typeof locales)
                    "
                >
                    <SelectTrigger class="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="[id, { name }] of Object.entries(locales)"
                            :value="id"
                            :key="id"
                        >
                            {{ name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div class="flex items-center justify-between">
                <div>
                    <Label>{{ t('SETTINGS.DEV_MODE') }}</Label>
                </div>
                <Switch
                    :checked="storage.settings.autoEnableDevMode"
                    @update:checked="(v: boolean) => (storage.settings.autoEnableDevMode = v)"
                />
            </div>
        </div>
    </section>
</template>
