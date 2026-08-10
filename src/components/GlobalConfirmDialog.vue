<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useConfirm } from '@/composables/options/useConfirm';
import useTranslation from '@/composables/useTranslation';

const t = useTranslation();
const confirm = useConfirm();
</script>

<template>
    <AlertDialog v-model:open="confirm.isOpen">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ t('DIALOG.CONFIRM.TITLE') }}</AlertDialogTitle>
                <AlertDialogDescription class="text-primary-foreground">
                    {{ confirm.message }}
                </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
                <AlertDialogCancel
                    class="hover:bg-destructive border-none"
                    @click="confirm.cancel()"
                    >{{ t('DIALOG.CONFIRM.CANCEL') }}</AlertDialogCancel
                >
                <AlertDialogAction @click="confirm.confirm()">{{
                    t('DIALOG.CONFIRM.CONFIRM')
                }}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
