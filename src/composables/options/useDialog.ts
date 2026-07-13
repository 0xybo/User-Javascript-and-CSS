import { reactive, watch } from '#imports';

class Dialog {
    public isOpen: boolean = false;
    public title: string = '';
    public message: string = '';
    public actions: { id: string; label: string; callback: () => void; class?: string }[] = [];
    public resolver: (() => void) | null = null;

    constructor() {
        return reactive(this) as unknown as Dialog;
    }

    public open(options: {
        title: string;
        message?: string;
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

export function useDialog() {
    return new Dialog();
}
