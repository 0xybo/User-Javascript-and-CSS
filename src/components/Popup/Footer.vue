<script setup lang="ts">
import { BookPlus, TriangleAlert } from 'lucide-vue-next';
import Button from '../ui/button/Button.vue';

const tab = ref<Browser.tabs.Tab | null>(null);
const hasAccess = ref<boolean>(false);

onMounted(async () => {
    const [queriedTab] = await browser.tabs.query({ active: true, currentWindow: true });

    if (!queriedTab?.id || !queriedTab?.url) return;

    tab.value = queriedTab;

    if (queriedTab.url.startsWith('http'))
        browser.scripting
            .executeScript({
                target: { tabId: queriedTab.id },
                func: () => 1,
            })
            .then((result) => result && result[0] && (hasAccess.value = true))
            .catch((err) => console.warn(err));
});

function getHost(url: string): string {
    return new URL(url).host;
}

function newRule() {
    if (!tab.value?.url) return;
    const tabUrl = new URL(tab.value.url);
    const optionUrl = new URL(browser.runtime.getURL('/options.html'));
    optionUrl.searchParams.set('url', `${tabUrl.protocol}//${tabUrl.host}/*`);
    window.open(optionUrl);
}
</script>

<template>
    <div v-if="!hasAccess" class="bg-destructive/10 flex flex-row gap-3 px-4 py-2">
        <div class="flex items-center justify-center"><TriangleAlert class="text-destructive" /></div>
        <div class="text-xs">{{ i18n.t('POPUP_NO_ACCESS') }}</div>
    </div>
    <div v-else-if="tab" class="flex items-center justify-center px-4 py-2">
        <Button
            class="bg-accent text-accent-foreground h-[unset] w-full py-3 font-normal text-ellipsis"
            variant="ghost"
            @click="newRule"
        >
            <BookPlus />
            {{ i18n.t('POPUP_NEW', [getHost(tab.url!)]) }}
        </Button>
    </div>
</template>

<style lang="css" scoped></style>
