<script setup lang="ts">
import { computed, i18n } from '#imports';
import TooltipWrapper from '@/components/TooltipWrapper.vue';
import { useState } from '@/composables/options/useState';
import { FileType } from '@/lib/storage/types';
import {
    BoxIcon,
    EyeIcon,
    FileExclamationPointIcon,
    FlameIcon,
    LayersIcon,
    TerminalIcon,
    WandSparklesIcon,
} from 'lucide-vue-next';
import ActionButton from './ActionButton.vue';

const state = useState();
const props = defineProps<{
    type: FileType;
}>();
const type = computed(() => (props.type === FileType.Style ? 'STYLE' : 'SCRIPT'));
const title = computed(() => i18n.t(`COMMON_${type.value}`));
const tooltip = computed(() => ({
    title: i18n.t(`EDITOR_ACTION_PANEL_${type.value}_TITLE`),
    description: i18n.t(`EDITOR_ACTION_PANEL_${type.value}_DESCRIPTION`),
}));

function onBeautifyButtonClick() {
    // TODO Beautify code
}
function onPreviewButtonClick() {
    // TODO Preview compiled code
    // Recompile code and show it
    // Add save button in the modal at the top next to close button
}
</script>

<template>
    <div
        class="bg-background absolute right-6 bottom-4 z-10 flex flex-row items-center gap-1 rounded-xl py-1 pr-1 pl-4 text-nowrap"
    >
        <TooltipWrapper
            class="max-w-60"
            :content-props="{
                side: 'top',
                sideOffset: 16,
                avoidCollisions: true,
                collisionPadding: { left: 20 },
            }"
        >
            <div class="text-muted mr-1">{{ title }}</div>

            <template #content>
                <div class="mb-1 text-sm">{{ tooltip.title }}</div>
                <div class="text-foreground/75">{{ tooltip.description }}</div>
            </template>
        </TooltipWrapper>

        <ActionButton
            :icon="WandSparklesIcon"
            :tooltip="{
                title: i18n.t('EDITOR_BEAUTIFY'),
            }"
            @click="onBeautifyButtonClick"
        />
        <template v-if="props.type === FileType.Style">
            <ActionButton
                :icon="TerminalIcon"
                :tooltip="{
                    title: i18n.t('EDITOR_STYLE_INJECTED_TITLE'),
                    description: i18n.t('EDITOR_STYLE_INJECTED_DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.style.injected"
            />
            <ActionButton
                :icon="FileExclamationPointIcon"
                :tooltip="{
                    title: i18n.t('EDITOR_STYLE_IMPORTANT_TITLE'),
                    description: i18n.t('EDITOR_STYLE_IMPORTANT_DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.style.important"
            />
        </template>
        <template v-else>
            <ActionButton
                :icon="BoxIcon"
                :tooltip="{
                    title: i18n.t('EDITOR_SCRIPT_ISOLATED_TITLE'),
                    description: i18n.t('EDITOR_SCRIPT_ISOLATED_DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.script.isolated"
            />
            <ActionButton
                :icon="LayersIcon"
                :tooltip="{
                    title: i18n.t('EDITOR_SCRIPT_RECURSIVE_TITLE'),
                    description: i18n.t('EDITOR_SCRIPT_RECURSIVE_DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.script.recursive"
            />
            <ActionButton
                :icon="FlameIcon"
                :tooltip="{
                    title: i18n.t('EDITOR_SCRIPT_AT_START_TITLE'),
                    description: i18n.t('EDITOR_SCRIPT_AT_START_DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.script.atStart"
            />
        </template>
        <ActionButton
            :icon="EyeIcon"
            :tooltip="{
                title: i18n.t('EDITOR_PREVIEW'),
            }"
            @click="onPreviewButtonClick"
        />
    </div>
</template>
