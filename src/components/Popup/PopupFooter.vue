<script setup lang="ts">
import { browser, i18n } from '#imports';
import { useCurrentTab, useHasAccess } from '@/composables/popup/useCurrentTab';
import { useStorage } from '@/composables/useStorage';
import { ItemType, RuleT } from '@/lib/storage/types';
import { BookPlus, TriangleAlert } from 'lucide-vue-next';
import Button from '../ui/button/Button.vue';
import Tooltip from '../ui/tooltip/Tooltip.vue';
import TooltipContent from '../ui/tooltip/TooltipContent.vue';
import TooltipTrigger from '../ui/tooltip/TooltipTrigger.vue';

const storage = useStorage();
const tab = useCurrentTab();
const hasAccess = useHasAccess();

function getHost(url: string): string {
    return new URL(url).host;
}

function newRule() {
    if (!tab.value?.url) return;
    const tabUrl = new URL(tab.value.url);
    const draft = storage.createDraftFromType(ItemType.Rule);
    (draft.item as RuleT).patterns = `${tabUrl.protocol}//${tabUrl.host}/*`;
    draft.item.name = tabUrl.host;
    const optionUrl = new URL(browser.runtime.getURL('/options.html'));
    optionUrl.hash = 'r:' + draft.item.id;
    window.open(optionUrl);
}
</script>

<template>
    <div v-if="!hasAccess" class="bg-destructive/10 flex flex-row gap-3 px-4 py-2">
        <div class="flex items-center justify-center">
            <TriangleAlert class="text-destructive" />
        </div>
        <div class="text-xs">{{ i18n.t('POPUP_NO_ACCESS') }}</div>
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
                        {{ i18n.t('POPUP_NEW', [getHost(tab.url!)]) }}
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
