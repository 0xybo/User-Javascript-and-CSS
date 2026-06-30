import { reactive, ref, watch } from '#imports';

interface Action {
    id: string;
    label: string;
    callback: () => void;
    class?: string;
}

const isOpen = ref(false);
const title = ref('');
const message = ref('');
const actions = reactive<Action[]>([]);
let resolver: (() => void) | null = null;

function open(options: {
    title: string;
    message?: string;
    actions?: Omit<Action, 'id'>[];
}): Promise<void> {
    if (isOpen.value) isOpen.value = false;

    title.value = options.title;
    message.value = options.message ?? '';
    actions.splice(0, actions.length);
    actions.push(
        ...(options.actions?.map((action) => ({ ...action, id: crypto.randomUUID() })) || []),
    );
    isOpen.value = true;

    watch(
        isOpen,
        (open) => {
            if (!open) resolver?.();
        },
        { once: true },
    );

    return new Promise((resolve) => (resolver = resolve));
}

export function useDialog() {
    return {
        isOpen,
        title,
        message,
        actions,
        open,
    };
}
