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

import { useConfirm } from '@/composables/useConfirm';

const confirm = useConfirm();
</script>

<template>
    <AlertDialog v-model:open="confirm.isOpen">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ i18n.t('DIALOG_CONFIRM_TITLE') }}</AlertDialogTitle>
                <AlertDialogDescription class="text-primary-foreground">
                    {{ confirm.message }}
                </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
                <AlertDialogCancel class="hover:bg-destructive border-none" @click="confirm.cancel()">{{
                    i18n.t('DIALOG_CONFIRM_CANCEL')
                }}</AlertDialogCancel>
                <AlertDialogAction @click="confirm.confirm()">{{ i18n.t('DIALOG_CONFIRM_CONFIRM') }}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
