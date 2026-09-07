<script setup lang="ts">
import { computed, reactive } from '#imports';
import PreviewDialog from '@/components/Dialog/PreviewDialog.vue';
import TooltipWrapper from '@/components/TooltipWrapper.vue';
import { useDialog } from '@/composables/options/useDialog.ts';
import useState from '@/composables/options/useState';
import { useStorage } from '@/composables/useStorage';
import { useToast } from '@/composables/useToast.ts';
import useTranslation from '@/composables/useTranslation.ts';
import { compileSCSS } from '@/lib/compiler/scss';
import { compileTS } from '@/lib/compiler/typescript';
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
import estreePlugin from 'prettier/plugins/estree';
import scssPlugin from 'prettier/plugins/postcss';
import typecriptPlugin from 'prettier/plugins/typescript';
import prettier from 'prettier/standalone';
import ActionButton from './ActionButton.vue';

const t = useTranslation();
const state = useState();
const storage = useStorage();
const props = defineProps<{
    type: FileType;
    settings?: boolean;
    preview?: boolean;
}>();
const toast = useToast();

const model = defineModel<string>();

const type = computed(() => {
    switch (props.type) {
        case FileType.Typescript:
        case FileType.Javascript:
            return 'SCRIPT';
        case FileType.Css:
        case FileType.Scss:
            return 'STYLE';
        default:
            return 'SCRIPT';
    }
});

const content = computed(() => model.value ?? '');

const title = computed(() => t(`COMMON.${type.value}`));

const tooltip = computed(() => ({
    title: t(`EDITOR.ACTION_PANEL.${type.value}.TITLE`),
    description: t(`EDITOR.ACTION_PANEL.${type.value}.DESCRIPTION`),
}));

const preview = reactive({
    opened: false,
    content: '',
    type: computed(() => {
        switch (props.type) {
            case FileType.Typescript:
            case FileType.Javascript:
                return FileType.Javascript;
            case FileType.Css:
            case FileType.Scss:
                return FileType.Css;
            default:
                return props.type;
        }
    }),
});

/**
 * Handles the click event for the beautify button. The formatted text is written back to the
 * editor model, which the parent binds to the appropriate draft buffer (rule or module file).
 */
async function onBeautifyButtonClick() {
    if (!model.value) return;
    try {
        model.value = await prettier.format(model.value, {
            parser:
                props.type === FileType.Css || props.type === FileType.Scss ? 'css' : 'typescript',
            plugins: [typecriptPlugin, estreePlugin, scssPlugin],
            tabWidth: storage.settings.editor.tabSize,
        });
    } catch (error) {
        toast.error({
            title: t('TOAST.EDITOR.BEAUTIFY_ERROR.TITLE'),
            description: t('TOAST.EDITOR.BEAUTIFY_ERROR.DESCRIPTION'),
        });
    }
}

/**
 * Handles the click event for the preview button.
 *
 * If the file type is a script, it compiles the source (TypeScript or JavaScript) and sets the
 * preview content. If the file type is a style, it compiles the SCSS code and sets the preview
 * content.
 * If the compilation fails, it opens a dialog to inform the user about the error.
 */
async function onPreviewButtonClick() {
    if (props.type === FileType.Typescript || props.type === FileType.Javascript) {
        const result = await compileTS(content.value);
        preview.content = result.output;
    } else {
        const result = await compileSCSS(content.value, {
            important: state.rule.item.style.important,
        });
        preview.content = result.output;
    }

    if (preview.content) preview.opened = true;
    else {
        preview.opened = false;
        const dialog = useDialog();
        await dialog.open({
            title: t('EDITOR.PREVIEW_ERROR.TITLE'),
            message: t('EDITOR.PREVIEW_ERROR.DESCRIPTION'),
        });
    }
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
            :disabled="!content"
            :tooltip="{
                title: t('EDITOR.BEAUTIFY'),
            }"
            @click="onBeautifyButtonClick"
        />
        <template
            v-if="(props.type === FileType.Css || props.type === FileType.Scss) && props.settings"
        >
            <ActionButton
                :icon="TerminalIcon"
                :tooltip="{
                    title: t('EDITOR.STYLE_INJECTED.TITLE'),
                    description: t('EDITOR.STYLE_INJECTED.DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.style.injected"
            />
            <ActionButton
                :icon="FileExclamationPointIcon"
                :tooltip="{
                    title: t('EDITOR.STYLE_IMPORTANT.TITLE'),
                    description: t('EDITOR.STYLE_IMPORTANT.DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.style.important"
            />
        </template>
        <template v-else-if="props.settings">
            <ActionButton
                :icon="BoxIcon"
                :tooltip="{
                    title: t('EDITOR.SCRIPT_ISOLATED.TITLE'),
                    description: t('EDITOR.SCRIPT_ISOLATED.DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.script.isolated"
            />
            <ActionButton
                :icon="LayersIcon"
                :tooltip="{
                    title: t('EDITOR.SCRIPT_RECURSIVE.TITLE'),
                    description: t('EDITOR.SCRIPT_RECURSIVE.DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.script.recursive"
            />
            <ActionButton
                :icon="FlameIcon"
                :tooltip="{
                    title: t('EDITOR.SCRIPT_AT_START.TITLE'),
                    description: t('EDITOR.SCRIPT_AT_START.DESCRIPTION'),
                }"
                :bubble="true"
                v-model:active="state.rule.item.script.atStart"
            />
        </template>
        <ActionButton
            :icon="EyeIcon"
            :tooltip="{
                title: t('EDITOR.PREVIEW'),
            }"
            v-if="props.preview"
            @click="onPreviewButtonClick"
            :disabled="!content"
        />
    </div>

    <PreviewDialog v-bind="preview" v-model="preview.opened" />
</template>
