import { reactive, watch } from '#imports';

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

    constructor() {
        return reactive(this) as unknown as Dialog;
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
 * Creates and returns a new instance of the {@link Dialog} class.
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
    return new Dialog();
}
