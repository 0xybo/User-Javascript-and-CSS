<script setup lang="ts">
import { browser } from '#imports';
import { useCurrentTab, useHasAccess } from '@/composables/popup/useCurrentTab';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation.ts';
import { ItemType } from '@/lib/storage/types';
import { BookPlus, TriangleAlert } from 'lucide-vue-next';
import Button from '../ui/button/Button.vue';
import Tooltip from '../ui/tooltip/Tooltip.vue';
import TooltipContent from '../ui/tooltip/TooltipContent.vue';
import TooltipTrigger from '../ui/tooltip/TooltipTrigger.vue';

const t = useTranslation();
const storage = useStorage();
const tab = useCurrentTab();
const hasAccess = useHasAccess();

/**
 * Extracts the host from a given URL string.
 * @param url - The URL string from which to extract the host.
 * @returns The host of the URL.
 */
function getHost(url: string): string {
    return new URL(url).host;
}

/**
 * Creates a new rule based on the current tab's URL and opens the options page with the new rule's
 * ID in the hash.
 */
function newRule() {
    if (!tab.value?.url) return;

    const tabUrl = new URL(tab.value.url);
    const draft = storage.createDraftFromType(ItemType.Rule);

    draft.item.patterns = tabUrl.host;
    draft.item.name = tabUrl.host;

    const optionUrl = new URL(browser.runtime.getURL('/options.html'));
    optionUrl.hash = 'rule:' + draft.item.id;

    window.open(optionUrl);
}
</script>

<template>
    <div v-if="!hasAccess" class="bg-destructive/10 flex flex-row gap-3 px-4 py-2">
        <div class="flex items-center justify-center">
            <TriangleAlert class="text-destructive" />
        </div>
        <div class="text-xs">{{ t('POPUP.NO_ACCESS') }}</div>
    </div>
    <div v-else-if="tab" class="flex items-center justify-center px-4 py-2">
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    class="bg-accent text-accent-foreground h-[unset] w-full py-3 font-normal"
                    variant="ghost"
                    @click="newRule"
                >
                    <BookPlus />
                    <span class="overflow-hidden text-nowrap text-ellipsis">
                        {{ t('POPUP.NEW', [getHost(tab.url!)]) }}
                    </span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {{ getHost(tab.url!) }}
            </TooltipContent>
        </Tooltip>
    </div>
</template>

<style lang="css" scoped></style>
