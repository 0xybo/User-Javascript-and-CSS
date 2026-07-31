import { onUnmounted, reactive, watch } from '#imports';
import type { Reactive } from 'vue';

/**
 * A class representing a dialog with a title, message, and actions.
 *
 * The dialog can be opened with specific options, and it returns a promise that resolves when the dialog is closed.
 * The dialog is reactive, allowing for dynamic updates to its properties.
 *
 * @example
 * const dialog = new Dialog();
 * dialog.open({
 *   title: 'Confirm Action',
 *   message: 'Are you sure you want to proceed?',
 *   actions: [
 *     { label: 'Cancel', callback: () => console.log('Cancelled') },
 *     { label: 'Confirm', callback: () => console.log('Confirmed') },
 *   ],
 * }).then(() => {
 *   console.log('Dialog closed');
 * });
 */
class Dialog {
    /**
     * An array of all instances of the Dialog class.
     * This allows for tracking and managing multiple dialog instances.
     */
    private static instances: Reactive<Map<string, Dialog>> = reactive(new Map());

    /**
     * Registers an instance of the Dialog class with the specified ID.
     * This is useful for managing multiple dialog instances and ensuring that each instance can be
     * uniquely identified.
     */
    static registerInstance(id: string, instance: Dialog) {
        Dialog.instances.set(id, instance);
    }

    /**
     * Unregisters the instance of the Dialog class with the specified ID.
     * This is useful for cleaning up instances when they are no longer needed.
     *
     * @param id The ID of the dialog instance to unregister.
     */
    static unregisterInstance(id: string) {
        Dialog.instances.delete(id);
    }

    /**
     * Returns the instance of the Dialog class with the specified ID.
     *
     * @param id The ID of the dialog instance to retrieve.
     * @returns The Dialog instance with the specified ID, or undefined if not found.
     */
    static getInstance(id: string): Dialog | undefined {
        return Dialog.instances.get(id);
    }

    /**
     * Returns all instances of the Dialog class.
     * This allows for managing and interacting with all dialog instances in the application.
     */
    static getAllInstances(): Map<string, Dialog> {
        return Dialog.instances;
    }

    /** Whether the dialog is open. */
    public isOpen: boolean = false;
    /** The title of the dialog. */
    public title: string = '';
    /** The message of the dialog. */
    public message: string = '';
    /** The actions available in the dialog. */
    public actions: { id: string; label: string; callback: () => void; class?: string }[] = [];
    /** The resolver for the dialog's promise. */
    public resolver: (() => void) | null = null;
    public readonly id: string = crypto.randomUUID();

    constructor() {
        return reactive(this) as Dialog;
    }

    /**
     * Opens the dialog with the specified options.
     *
     * @param options The options for the dialog, including title, message, and actions.
     * @returns A promise that resolves when the dialog is closed.
     */
    public open(options: {
        /** The title of the dialog. */
        title: string;
        /** The message of the dialog. */
        message?: string;
        /** The actions available in the dialog. */
        actions?: Omit<{ id: string; label: string; callback: () => void; class?: string }, 'id'>[];
    }): Promise<void> {
        if (this.isOpen) this.isOpen = false;

        this.title = options.title;
        this.message = options.message ?? '';
        this.actions.splice(0, this.actions.length);
        this.actions.push(
            ...(options.actions?.map((action) => ({ ...action, id: crypto.randomUUID() })) || []),
        );
        this.isOpen = true;

        watch(
            () => this.isOpen,
            (open) => {
                if (!open) this.resolver?.();
            },
            { once: true },
        );

        return new Promise((resolve) => (this.resolver = resolve));
    }
}

/**
 * Returns a new instance of the {@link Dialog} class.
 * @returns A new Dialog instance.
 *
 * @example
 * const dialog = useDialog();
 * dialog.open({
 *   title: 'Confirm Action',
 *   message: 'Are you sure you want to proceed?',
 *   actions: [
 *     { label: 'Cancel', callback: () => console.log('Cancelled') },
 *     { label: 'Confirm', callback: () => console.log('Confirmed') },
 *   ],
 * }).then(() => {
 *   console.log('Dialog closed');
 * });
 */
export function useDialog() {
    const dialog = new Dialog();

    Dialog.registerInstance(dialog.id, dialog);
    onUnmounted(() => {
        Dialog.unregisterInstance(dialog.id);
    });

    return dialog;
}

/**
 * Returns all instances of the {@link Dialog} class.
 *
 * @internal
 * @returns A reactive map of all Dialog instances, keyed by their unique IDs.
 */
export function useDialogs() {
    return Dialog.getAllInstances();
}
