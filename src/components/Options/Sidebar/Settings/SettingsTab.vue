<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { useState } from '@/composables/options/useState';
import useTranslation from '@/composables/useTranslation';
import { SettingsSection } from '@/lib/options/settings';
import { cn } from '@/lib/tailwind';
import { CloudIcon, DatabaseIcon, PaintbrushIcon, PaletteIcon, PuzzleIcon } from 'lucide-vue-next';
import { computed } from 'vue';

const t = useTranslation();
const state = useState();

/**
 * Represents a section in the settings tab, including its ID, label, and icon.
 */
interface Section {
    /** The unique identifier for the section. */
    id: SettingsSection;
    /** The display label for the section. */
    label: string;
    /** The icon component associated with the section. */
    icon: typeof PaintbrushIcon;
}

/**
 * A list of sections available in the settings tab, each with an ID, label, and icon.
 */
const sections = computed(
    () =>
        [
            { id: SettingsSection.Editor, label: t('SETTINGS.EDITOR.TITLE'), icon: PaintbrushIcon },
            { id: SettingsSection.Theme, label: t('SETTINGS.THEME.TITLE'), icon: PaletteIcon },
            { id: SettingsSection.Extension, label: t('SETTINGS.EXTENSION'), icon: PuzzleIcon },
            { id: SettingsSection.CloudSync, label: t('SETTINGS.CLOUD_SYNC'), icon: CloudIcon },
            { id: SettingsSection.Storage, label: t('SETTINGS.STORAGE'), icon: DatabaseIcon },
        ] as Section[],
);

/**
 * Handles the click event for a section in the settings tab.
 *
 * @param id The ID of the section that was clicked.
 */
function onSectionClick(id: SettingsSection) {
    state.switchSettingsSection(id);
}
</script>

<template>
    <div class="flex flex-col px-2 py-3">
        <div class="mb-2 px-2 text-xs tracking-widest uppercase select-none">
            {{ t('COMMON.SETTINGS') }}
        </div>
        <div class="flex flex-col gap-1">
            <Button
                v-for="section in sections"
                :key="section.id"
                variant="ghost"
                :class="
                    cn(
                        'text-foreground flex w-full flex-row items-center justify-start gap-3 px-3 py-2 text-sm!',
                        {
                            'text-accent-foreground! bg-accent hover:bg-accent/90':
                                state.settingsSection === section.id,
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
