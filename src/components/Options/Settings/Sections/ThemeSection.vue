<script setup lang="ts">
import { i18n } from '#imports';
import Label from '@/components/ui/label/Label.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { DarkThemePalette, LightThemePalette, Theme } from '@/lib/storage/theme';
import { useStorage } from '@/composables/useStorage';

const storage = useStorage();

const THEME_OPTIONS = [
    { value: Theme.Auto, label: i18n.t('SETTINGS_THEME_AUTO') },
    { value: Theme.Light, label: i18n.t('SETTINGS_THEME_LIGHT') },
    { value: Theme.Dark, label: i18n.t('SETTINGS_THEME_DARK') },
];

const LIGHT_PALETTES = Object.values(LightThemePalette).map((v) => ({
    value: v,
    label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const DARK_PALETTES = Object.values(DarkThemePalette).map((v) => ({
    value: v,
    label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));
</script>

<template>
    <section id="settings-theme" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ i18n.t('SETTINGS_THEME') }}
        </h2>
        <Separator />
        <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
                <Label>{{ i18n.t('SETTINGS_THEME_MODE') }}</Label>
                <Select
                    :model-value="storage.settings.theme"
                    @update:model-value="
                        (v: unknown) =>
                            (storage.settings.theme = v as Theme)
                    "
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="opt in THEME_OPTIONS"
                            :key="opt.value"
                            :value="opt.value"
                        >
                            {{ opt.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div class="space-y-2">
                <Label>{{ i18n.t('SETTINGS_THEME_LIGHT_PALETTE') }}</Label>
                <Select
                    :model-value="storage.settings.themePalette.light"
                    @update:model-value="
                        (v: unknown) =>
                            (storage.settings.themePalette.light =
                                v as LightThemePalette)
                    "
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="pal in LIGHT_PALETTES"
                            :key="pal.value"
                            :value="pal.value"
                        >
                            {{ pal.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div class="space-y-2">
                <Label>{{ i18n.t('SETTINGS_THEME_DARK_PALETTE') }}</Label>
                <Select
                    :model-value="storage.settings.themePalette.dark"
                    @update:model-value="
                        (v: unknown) =>
                            (storage.settings.themePalette.dark =
                                v as DarkThemePalette)
                    "
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="pal in DARK_PALETTES"
                            :key="pal.value"
                            :value="pal.value"
                        >
                            {{ pal.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    </section>
</template>
