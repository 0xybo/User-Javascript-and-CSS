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

import { useDialog } from '@/composables/options/useDialog';
import { cn } from '@/lib/tailwind';

const dialog = useDialog();
</script>

<template>
    <AlertDialog v-model:open="dialog.isOpen">
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
