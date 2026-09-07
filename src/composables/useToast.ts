import { reactive } from '#imports';

/**
 * The visual style of a toast notification.
 */
export enum ToastVariant {
    Success = 'success',
    Error = 'error',
    Info = 'info',
}

/**
 * A single toast notification displayed in the toast viewport.
 */
export interface Toast {
    /** The unique identifier of the toast. */
    id: string;
    /** The title of the toast. */
    title: string;
    /** An optional longer description shown below the title. */
    description?: string;
    /** The visual style of the toast. Defaults to 'success'. */
    variant: ToastVariant;
    /** How long the toast stays visible in milliseconds before auto-dismissing. */
    duration: number;
}

/**
 * The options used to create a toast notification.
 */
export interface ToastOptions {
    /** The title of the toast. */
    title: string;
    /** An optional longer description shown below the title. */
    description?: string;
    /** The visual style of the toast. Defaults to 'success'. */
    variant?: ToastVariant;
    /** How long the toast stays visible in milliseconds before auto-dismissing. */
    duration?: number;
}

/** The list of currently visible toast notifications. */
const toasts = reactive<Toast[]>([]);

/**
 * Displays a toast notification in the toast viewport.
 *
 * @param options The options used to create the toast.
 * @returns The unique identifier of the created toast.
 */
function push(options: ToastOptions): string {
    const id = crypto.randomUUID();
    toasts.push({
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? ToastVariant.Success,
        duration: options.duration ?? 3500,
    });
    setTimeout(() => remove(id), options.duration ?? 3500);
    return id;
}

/**
 * Creates a function that displays a toast notification with the specified visual style.
 *
 * @param variant The visual style of the toast.
 * @returns A function that displays a toast notification with the specified visual style.
 */
function withVariant(variant: ToastVariant) {
    return (options: Omit<ToastOptions, 'variant'>) => push({ ...options, variant });
}

/**
 * Removes the toast notification with the specified identifier from the toast viewport.
 *
 * @param id The unique identifier of the toast to remove.
 */
function remove(id: string) {
    const index = toasts.findIndex((toast) => toast.id === id);
    if (index !== -1) toasts.splice(index, 1);
}

/**
 * Provides access to the global toast store.
 *
 * @returns An object with the list of visible toasts and the push/remove functions.
 *
 * @example
 * const { push } = useToast();
 * push({ title: 'Rule saved', variant: 'success' });
 */
export function useToast() {
    return {
        toasts,
        push,
        remove,
        success: withVariant(ToastVariant.Success),
        error: withVariant(ToastVariant.Error),
        info: withVariant(ToastVariant.Info),
    };
}
