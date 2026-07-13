<script setup lang="ts">
import { i18n } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import { useState } from '@/composables/options/useState';
import { Panel } from '@/lib/options/panel';
import { cn } from '@/lib/tailwind';
import {
    CloudIcon,
    DatabaseIcon,
    PaintbrushIcon,
    PaletteIcon,
    PuzzleIcon,
} from 'lucide-vue-next';

const state = useState();

interface Section {
    id: string;
    label: string;
    icon: typeof PaintbrushIcon;
}

const SECTIONS: Section[] = [
    { id: 'editor', label: i18n.t('SETTINGS_EDITOR'), icon: PaintbrushIcon },
    { id: 'theme', label: i18n.t('SETTINGS_THEME'), icon: PaletteIcon },
    { id: 'extension', label: i18n.t('SETTINGS_EXTENSION'), icon: PuzzleIcon },
    { id: 'cloud-sync', label: i18n.t('SETTINGS_CLOUD_SYNC'), icon: CloudIcon },
    { id: 'storage', label: i18n.t('SETTINGS_STORAGE'), icon: DatabaseIcon },
];

function onSectionClick(id: string) {
    state.panel = Panel.Settings;
    state.settingsSection = id;
}
</script>

<template>
    <div class="flex flex-col px-2 py-3">
        <div class="mb-2 px-2 text-xs tracking-widest uppercase select-none">
            {{ i18n.t('COMMON_SETTINGS') }}
        </div>
        <div class="flex flex-col gap-1">
            <Button
                v-for="section in SECTIONS"
                :key="section.id"
                variant="ghost"
                :class="
                    cn(
                        'text-foreground flex w-full flex-row items-center justify-start gap-3 px-3 py-2 text-sm!',
                        {
                            'text-accent! bg-accent/10': state.settingsSection === section.id,
                        },
                    )
                "
                @click="() => onSectionClick(section.id)"
            >
                <component :is="section.icon" :size="18" class="shrink-0" />
                {{ section.label }}
            </Button>
        </div>
    </div>
</template>

<style lang="css" scoped></style>
