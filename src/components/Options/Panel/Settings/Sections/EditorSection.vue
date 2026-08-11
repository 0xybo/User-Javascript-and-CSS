<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Label from '@/components/ui/label/Label.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation';
import { Editor } from '@/lib/storage/editor';
import { cn } from '@/lib/tailwind';

const t = useTranslation();
const storage = useStorage();

/**
 * A list of available editor types, each with a value and a label for display.
 */
const EDITOR_TYPES = [
    { value: Editor.Monaco, label: t('SETTINGS.EDITOR.MONACO') },
    { value: Editor.Ace, label: t('SETTINGS.EDITOR.ACE') },
    { value: Editor.Codemirror, label: t('SETTINGS.EDITOR.CODEMIRROR') },
];
</script>

<template>
    <section id="settings-editor" class="space-y-4">
        <h2 class="text-lg font-semibold">
            {{ t('SETTINGS.EDITOR.TITLE') }}
        </h2>
        <Separator />
        <div class="space-y-4">
            <div class="space-y-2">
                <div class="space-y-1">
                    <Label>{{ t('SETTINGS.EDITOR.SELECT') }}</Label>
                    <p class="text-muted-foreground text-xs">
                        {{ t('SETTINGS.EDITOR.SELECT_DESCRIPTION') }}
                    </p>
                </div>
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
                <div class="space-y-1">
                    <Label>{{ t('SETTINGS.FONT_SIZE') }}</Label>
                    <p class="text-muted-foreground text-xs">
                        {{ t('SETTINGS.FONT_SIZE_DESCRIPTION') }}
                    </p>
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
                <div class="space-y-1">
                    <Label>{{ t('SETTINGS.FONT_FAMILY') }}</Label>
                    <p class="text-muted-foreground text-xs">
                        {{ t('SETTINGS.FONT_FAMILY_DESCRIPTION') }}
                    </p>
                    <Input
                        :model-value="storage.settings.editor.fontFamily"
                        placeholder="JetBrains Mono"
                        @update:model-value="
                            (v: unknown) => (storage.settings.editor.fontFamily = String(v))
                        "
                    />
                </div>
                <div class="space-y-1">
                    <Label>{{ t('SETTINGS.TAB_SIZE') }}</Label>
                    <p class="text-muted-foreground text-xs">
                        {{ t('SETTINGS.TAB_SIZE_DESCRIPTION') }}
                    </p>
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
                    <div class="space-y-1">
                        <Label>{{ t('SETTINGS.WORD_WRAP') }}</Label>
                        <p class="text-muted-foreground text-xs">
                            {{ t('SETTINGS.WORD_WRAP_DESCRIPTION') }}
                        </p>
                    </div>
                    <Switch
                        :model-value="storage.settings.editor.wrap"
                        @update:model-value="(v: boolean) => (storage.settings.editor.wrap = v)"
                    />
                </div>
                <div class="flex items-center justify-between">
                    <div class="space-y-1">
                        <Label>{{ t('SETTINGS.LIGATURES') }}</Label>
                        <p class="text-muted-foreground text-xs">
                            {{ t('SETTINGS.LIGATURES_DESCRIPTION') }}
                        </p>
                    </div>
                    <Switch
                        :model-value="storage.settings.editor.ligatures"
                        @update:model-value="
                            (v: boolean) => (storage.settings.editor.ligatures = v)
                        "
                    />
                </div>
                <div class="flex items-center justify-between">
                    <div class="space-y-1">
                        <Label>{{ t('SETTINGS.INVISIBLE_CHARS') }}</Label>
                        <p class="text-muted-foreground text-xs">
                            {{ t('SETTINGS.INVISIBLE_CHARS_DESCRIPTION') }}
                        </p>
                    </div>
                    <Switch
                        :model-value="storage.settings.editor.invisibleChars"
                        @update:model-value="
                            (v: boolean) => (storage.settings.editor.invisibleChars = v)
                        "
                    />
                </div>
                <div class="flex items-center justify-between">
                    <div class="space-y-1">
                        <Label>{{ t('SETTINGS.SOFT_TABS') }}</Label>
                        <p class="text-muted-foreground text-xs">
                            {{ t('SETTINGS.SOFT_TABS_DESCRIPTION') }}
                        </p>
                    </div>
                    <Switch
                        :model-value="storage.settings.editor.softTabs"
                        @update:model-value="(v: boolean) => (storage.settings.editor.softTabs = v)"
                    />
                </div>
                <div
                    v-if="storage.settings.editor.name === 'monaco'"
                    class="flex items-center justify-between"
                >
                    <div class="space-y-1">
                        <Label>{{ t('SETTINGS.MINIMAP') }}</Label>
                        <p class="text-muted-foreground text-xs">
                            {{ t('SETTINGS.MINIMAP_DESCRIPTION') }}
                        </p>
                    </div>
                    <Switch
                        :model-value="(storage.settings.editor as any).minimap"
                        @update:model-value="
                            (v: boolean) => ((storage.settings.editor as any).minimap = v)
                        "
                    />
                </div>
            </div>
        </div>
    </section>
</template>
