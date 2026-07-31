<script setup lang="ts">
import { i18n } from '#imports';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import type { FileType } from '@/lib/storage/types';
import CodeEditor from '../Editor/CodeEditor.vue';
import DialogDescription from '../ui/dialog/DialogDescription.vue';

const props = defineProps<{ content: string; type: FileType }>();

const isOpenModel = defineModel<boolean>({ required: true });
</script>

<template>
    <Dialog v-model:open="isOpenModel">
        <DialogContent class="size-[90%] max-w-full">
            <DialogHeader>
                <DialogTitle>{{ i18n.t('DIALOG_PREVIEW_TITLE') }}</DialogTitle>
                <DialogDescription class="text-primary-foreground">
                    {{ i18n.t('DIALOG_PREVIEW_DESCRIPTION') }}
                </DialogDescription>
            </DialogHeader>
            <CodeEditor
                :language="props.type"
                :model-value="props.content"
                :readonly="true"
                :actions-bar="false"
            />
        </DialogContent>
    </Dialog>
</template>
