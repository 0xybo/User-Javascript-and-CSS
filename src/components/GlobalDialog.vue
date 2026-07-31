<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useDialogs } from '@/composables/options/useDialog';
import { cn } from '@/lib/tailwind';

const dialogs = useDialogs();
</script>

<template>
    <AlertDialog
        v-for="[id, dialog] of dialogs"
        :key="id"
        v-model:open="dialog.isOpen as unknown as boolean"
    >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ dialog.title }}</AlertDialogTitle>
                <AlertDialogDescription class="text-primary-foreground">
                    {{ dialog.message }}
                </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
                <AlertDialogAction
                    v-for="action of dialog.actions"
                    :key="action.id"
                    :class="cn(action.class)"
                    @click="action.callback"
                >
                    {{ action.label }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
