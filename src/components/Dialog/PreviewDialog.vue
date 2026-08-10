<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import useTranslation from '@/composables/useTranslation.ts';
import type { FileType } from '@/lib/storage/types';
import CodeEditor from '../Editor/CodeEditor.vue';
import DialogDescription from '../ui/dialog/DialogDescription.vue';

const props = defineProps<{ content: string; type: FileType }>();

const t = useTranslation();

const isOpenModel = defineModel<boolean>({ required: true });
</script>

<template>
    <Dialog v-model:open="isOpenModel">
        <DialogContent class="size-[90%] max-w-full">
            <DialogHeader>
                <DialogTitle>{{ t('DIALOG.PREVIEW.TITLE') }}</DialogTitle>
                <DialogDescription class="text-primary-foreground">
                    {{ t('DIALOG.PREVIEW.DESCRIPTION') }}
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
