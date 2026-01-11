<script setup lang="ts">
import { i18n } from '#i18n';
import { BoltIcon } from 'lucide-vue-next';
import Button from '../ui/button/Button.vue';
import Tooltip from '../ui/tooltip/Tooltip.vue';
import TooltipContent from '../ui/tooltip/TooltipContent.vue';
import TooltipTrigger from '../ui/tooltip/TooltipTrigger.vue';

const manifest = browser.runtime.getManifest();

function openOptions() {
    if (browser.runtime.openOptionsPage) browser.runtime.openOptionsPage();
    else window.open(browser.runtime.getURL('/options.html'));
}
</script>

<template>
    <header class="bg-primary flex flex-row items-center justify-between gap-3 px-4 py-3">
        <div class="flex flex-col">
            <div>{{ i18n.t('EXTENSION_NAME') }}</div>
            <div class="text-muted">v{{ manifest.version }}</div>
        </div>
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    class="hover:bg-secondary hover:text-secondary-foreground flex aspect-square justify-center bg-transparent px-2"
                    @click="openOptions"
                >
                    <BoltIcon />
                </Button>
            </TooltipTrigger>
            <TooltipContent class="select-none">
                <p>{{ i18n.t('COMMON_OPTIONS') }}</p>
            </TooltipContent>
        </Tooltip>
    </header>
</template>

<style scoped></style>
