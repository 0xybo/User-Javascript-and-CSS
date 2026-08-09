<script setup lang="ts">
import { useToast, type ToastVariant } from '@/composables/useToast';
import { cn } from '@/lib/tailwind';
import { CheckCircle2Icon, CircleXIcon, InfoIcon, XIcon } from 'lucide-vue-next';
import type { FunctionalComponent, SVGAttributes } from 'vue';

const { toasts, remove } = useToast();

/**
 * The styling applied to a toast for each variant.
 */
const VARIANT_CLASSES: Record<ToastVariant, string> = {
    success: 'bg-success text-success-foreground',
    error: 'bg-destructive text-destructive-foreground',
    info: 'bg-primary text-primary-foreground',
};

/**
 * The icon displayed next to the toast title for each variant.
 */
const VARIANT_ICONS: Record<ToastVariant, FunctionalComponent<SVGAttributes>> = {
    success: CheckCircle2Icon,
    error: CircleXIcon,
    info: InfoIcon,
};

/**
 * Returns the CSS class for a given toast variant.
 *
 * @param variant - The variant of the toast.
 * @returns The CSS class corresponding to the variant.
 */
function variantClass(variant: ToastVariant) {
    return VARIANT_CLASSES[variant];
}

/**
 * Returns the icon component for a given toast variant.
 *
 * @param variant - The variant of the toast.
 * @returns The icon component corresponding to the variant.
 */
function variantIcon(variant: ToastVariant) {
    return VARIANT_ICONS[variant];
}
</script>

<template>
    <Teleport to="body">
        <div
            class="pointer-events-none fixed top-0 right-0 z-100 flex w-full max-w-sm flex-col gap-2 p-4"
        >
            <TransitionGroup
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="translate-x-2 opacity-0"
                enter-to-class="translate-x-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="translate-x-2 opacity-0"
            >
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    :class="
                        cn(
                            'pointer-events-auto flex flex-row items-start gap-2 rounded-lg px-4 py-3 shadow-lg',
                            variantClass(toast.variant),
                        )
                    "
                    role="status"
                >
                    <component :is="variantIcon(toast.variant)" class="mt-0.5 size-5 shrink-0" />
                    <div class="flex min-w-0 flex-col gap-1">
                        <div class="text-sm font-medium wrap-break-word">{{ toast.title }}</div>
                        <div v-if="toast.description" class="text-xs wrap-break-word opacity-80">
                            {{ toast.description }}
                        </div>
                    </div>
                    <button
                        class="ml-auto shrink-0 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
                        aria-label="Close"
                        @click="remove(toast.id)"
                    >
                        <XIcon class="size-4" />
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>
