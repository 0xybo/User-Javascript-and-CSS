import { reactive } from '#imports';

class Confirm {
    public isOpen: boolean = false;
    public message: string = '';
    public resolver: ((value: boolean) => void) | null = null;

    constructor() {
        return reactive(this) as unknown as Confirm;
    }

    public open(msg: string): Promise<boolean> {
        this.message = msg;
        this.isOpen = true;

        return new Promise((resolve) => (this.resolver = resolve));
    }

    public confirm() {
        this.isOpen = false;
        this.resolver?.(true);
        this.resolver = null;
    }

    public cancel() {
        this.isOpen = false;
        this.resolver?.(false);
        this.resolver = null;
    }
}

export function useConfirm() {
    return new Confirm();
}
