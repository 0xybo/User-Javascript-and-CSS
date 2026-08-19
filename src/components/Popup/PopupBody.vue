<script setup lang="ts">
import { browser, computed, ref } from '#imports';
import { useCurrentTab } from '@/composables/popup/useCurrentTab';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation.ts';
import { filterRulesByUrl } from '@/lib/rules';
import { IRule } from '@/lib/storage/types';
import { RefreshCcwIcon } from 'lucide-vue-next';
import RuleList from '../RuleList.vue';
import Button from '../ui/button/Button.vue';

const t = useTranslation();
const storage = useStorage();
const tab = useCurrentTab();
const rules = computed(() =>
    tab?.value?.url ? filterRulesByUrl(storage.rules, tab.value.url) : storage.rules,
);
const hasChanged = ref(false);

function reloadTab() {
    if (!tab.value?.id) return;
    browser.tabs.reload(tab.value?.id);
    hasChanged.value = false;
}

function onRuleListChange() {
    hasChanged.value = true;
}

function onRuleListOpen(rule: IRule) {
    if (!tab.value?.url) return;
    const optionUrl = new URL(browser.runtime.getURL('/options.html'));
    optionUrl.hash = 'rule:' + rule.id;
    window.open(optionUrl);
}
</script>

<template>
    <RuleList
        v-if="rules.length"
        :rules="rules"
        @change="onRuleListChange"
        @open="onRuleListOpen"
    />
    <div v-else class="text-muted min-h-15 px-4 py-5 text-sm">
        {{ t('POPUP.NO_RULES') }}
    </div>
    <div v-if="hasChanged" class="flex flex-row items-center gap-3 bg-blue-500/10 px-4 py-2">
        <RefreshCcwIcon class="size-7" :stroke-width="1.5" />
        <div class="inline w-full pr-4">
            {{ t('POPUP.REFRESH_NEEDED.PREFIX') }}
            <Button
                variant="link"
                @click="reloadTab"
                class="text-foreground h-auto p-0 pb-2 font-normal underline"
            >
                {{ t('POPUP.REFRESH_NEEDED.LINK') }}
            </Button>
            {{ t('POPUP.REFRESH_NEEDED.SUFFIX') }}
        </div>
    </div>
</template>
