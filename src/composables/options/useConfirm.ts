import { ref } from '#imports';
import { defineStore } from 'pinia';

export const useConfirm = defineStore('confirm', () => {
    const isOpen = ref(false);
    const message = ref('');
    let resolver: ((value: boolean) => void) | null = null;

    function open(msg: string): Promise<boolean> {
        message.value = msg;
        isOpen.value = true;

        return new Promise((resolve) => (resolver = resolve));
    }

    function confirm() {
        isOpen.value = false;
        resolver?.(true);
        resolver = null;
    }

    function cancel() {
        isOpen.value = false;
        resolver?.(false);
        resolver = null;
    }

    return {
        isOpen,
        message,
        open,
        confirm,
        cancel,
    };
});
