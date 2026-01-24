import { browser, Browser, onMounted, ref, Ref, watch } from '#imports';
import { Logger } from '../../lib/logger';

export function useCurrentTab(): Ref<Browser.tabs.Tab | null> {
    const tab = ref<Browser.tabs.Tab | null>(null);
    onMounted(async () => {
        const [queriedTab] = await browser.tabs.query({ active: true, currentWindow: true });

        if (!queriedTab?.id || !queriedTab?.url) return;

        tab.value = queriedTab;
    });

    return tab;
}

export function useHasAccess(): Ref<boolean> {
    const tab = useCurrentTab();
    const hasAccess = ref(false);

    watch(tab, () => {
        if (!tab.value || !tab.value.id || !tab.value.url || !tab.value.url.startsWith('http'))
            hasAccess.value = false;
        else
            browser.scripting
                .executeScript({
                    target: { tabId: tab.value.id },
                    func: () => 1,
                })
                .then((result) => result && result[0] && (hasAccess.value = true))
                .catch((err) => {
                    hasAccess.value = false;
                    Logger.error(err);
                });
    });

    return hasAccess;
}
