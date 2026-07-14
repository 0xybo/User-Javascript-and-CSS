<script setup lang="ts">
import { i18n } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Label from '@/components/ui/label/Label.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useStorage } from '@/composables/useStorage';
import { Editor } from '@/lib/storage/editor';
import { cn } from '@/lib/tailwind';

const storage = useStorage();

const EDITOR_TYPES = [
    { value: Editor.Monaco, label: i18n.t('SETTINGS_EDITOR_MONACO') },
    { value: Editor.Ace, label: i18n.t('SETTINGS_EDITOR_ACE') },
    { value: Editor.Codemirror, label: i18n.t('SETTINGS_EDITOR_CODEMIRROR') },
];
</script>

<template>
    <section id="settings-editor" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ i18n.t('SETTINGS_EDITOR') }}
        </h2>
        <Separator />
        <div class="space-y-4">
            <div class="space-y-2">
                <Label>{{ i18n.t('SETTINGS_EDITOR_SELECT') }}</Label>
                <div class="flex flex-wrap gap-2">
                    <Button
                        v-for="ed in EDITOR_TYPES"
                        :key="ed.value"
                        :variant="storage.settings.editor.name === ed.value ? 'default' : 'outline'"
                        :class="
                            cn({
                                'bg-accent text-accent-foreground hover:bg-accent/90':
                                    storage.settings.editor.name === ed.value,
                            })
                        "
                        size="sm"
                        @click="() => (storage.settings.editor.name = ed.value)"
                    >
                        {{ ed.label }}
                    </Button>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
                <div class="space-y-2">
                    <Label>{{ i18n.t('SETTINGS_FONT_SIZE') }}</Label>
                    <Input
                        type="number"
                        min="8"
                        max="32"
                        :model-value="storage.settings.editor.fontSize"
                        @update:model-value="
                            (v: unknown) =>
                                (storage.settings.editor.fontSize =
                                    typeof v === 'number' ? v : parseInt(v as string))
                        "
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ i18n.t('SETTINGS_FONT_FAMILY') }}</Label>
                    <Input
                        :model-value="storage.settings.editor.fontFamily"
                        placeholder="JetBrains Mono"
                        @update:model-value="
                            (v: unknown) => (storage.settings.editor.fontFamily = String(v))
                        "
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ i18n.t('SETTINGS_TAB_SIZE') }}</Label>
                    <Input
                        type="number"
                        min="1"
                        max="8"
                        :model-value="storage.settings.editor.tabSize"
                        @update:model-value="
                            (v: unknown) =>
                                (storage.settings.editor.tabSize =
                                    typeof v === 'number' ? v : parseInt(v as string))
                        "
                    />
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center justify-between">
                    <Label>{{ i18n.t('SETTINGS_WORD_WRAP') }}</Label>
                    <Switch
                        :checked="storage.settings.editor.wrap"
                        @update:checked="(v: boolean) => (storage.settings.editor.wrap = v)"
                    />
                </div>
                <div class="flex items-center justify-between">
                    <Label>{{ i18n.t('SETTINGS_LIGATURES') }}</Label>
                    <Switch
                        :checked="storage.settings.editor.ligatures"
                        @update:checked="(v: boolean) => (storage.settings.editor.ligatures = v)"
                    />
                </div>
                <div class="flex items-center justify-between">
                    <Label>{{ i18n.t('SETTINGS_INVISIBLE_CHARS') }}</Label>
                    <Switch
                        :checked="storage.settings.editor.invisibleChars"
                        @update:checked="
                            (v: boolean) => (storage.settings.editor.invisibleChars = v)
                        "
                    />
                </div>
                <div class="flex items-center justify-between">
                    <Label>{{ i18n.t('SETTINGS_SOFT_TABS') }}</Label>
                    <Switch
                        :checked="storage.settings.editor.softTabs"
                        @update:checked="(v: boolean) => (storage.settings.editor.softTabs = v)"
                    />
                </div>
                <div
                    v-if="storage.settings.editor.name === 'monaco'"
                    class="flex items-center justify-between"
                >
                    <Label>{{ i18n.t('SETTINGS_MINIMAP') }}</Label>
                    <Switch
                        :checked="(storage.settings.editor as any).minimap"
                        @update:checked="
                            (v: boolean) => ((storage.settings.editor as any).minimap = v)
                        "
                    />
                </div>
            </div>
        </div>
    </section>
</template>
