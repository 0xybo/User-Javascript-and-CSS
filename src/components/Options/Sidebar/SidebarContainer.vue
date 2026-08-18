<script setup lang="ts">
import type { Component } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Tooltip from '@/components/ui/tooltip/Tooltip.vue';
import TooltipContent from '@/components/ui/tooltip/TooltipContent.vue';
import TooltipTrigger from '@/components/ui/tooltip/TooltipTrigger.vue';
import useState from '@/composables/options/useState';
import useTranslation from '@/composables/useTranslation.ts';
import { Tab } from '@/lib/options/tab';
import { cn } from '@/lib/tailwind';
import { useEventListener } from '@vueuse/core';
import {
    BoltIcon,
    ClipboardListIcon,
    GripVerticalIcon,
    LucideIcon,
    MessageCircleHeartIcon,
    PackagePlusIcon,
} from 'lucide-vue-next';
import { ref } from 'vue';
import About from './About/AboutTab.vue';
import Modules from './Modules/ModulesTab.vue';
import Rules from './Rules/RulesTab.vue';
import Settings from './Settings/SettingsTab.vue';

const t = useTranslation();

/**
 * A mapping of tabs to their corresponding properties, including:
 * - icon: The icon to display for the tab.
 * - content: The component to render when the tab is active.
 * - title: The title of the tab, used for tooltips.
 * - devider: Whether to display a divider before the tab. If true, the tab icon will be pushed to the bottom of the sidebar.
 */
const TABS: {
    [K in Tab]: {
        icon: LucideIcon;
        content: Component;
        title: string;
        devider?: boolean;
    };
} = {
    [Tab.Rules]: {
        icon: ClipboardListIcon,
        content: Rules,
        title: t('COMMON.RULES'),
    },
    [Tab.Modules]: {
        icon: PackagePlusIcon,
        content: Modules,
        title: t('COMMON.MODULES'),
    },
    [Tab.Settings]: {
        icon: BoltIcon,
        content: Settings,
        title: t('COMMON.SETTINGS'),
    },
    [Tab.About]: {
        icon: MessageCircleHeartIcon,
        content: About,
        title: t('COMMON.ABOUT'),
        devider: true,
    },
};

const state = useState();

/** The minimum width of the sidebar in pixels. */
const SIDEBAR_MIN = 200;
/** The maximum width of the sidebar in pixels. */
const SIDEBAR_MAX = 500;
/** The current width of the sidebar in pixels. */
const sidebarWidth = ref(288);
/** Whether the sidebar is currently being resized. */
const isResizing = ref(false);
/** The starting X position of the mouse when resizing. */
let startX = 0;
/** The starting width of the sidebar when resizing. */
let startWidth = 0;

/**
 * Handles the click event for a tab in the sidebar.
 *
 * @param tab The tab that was clicked.
 */
function onTabClick(tab: Tab) {
    state.switchTab(tab);
}

/**
 * Handles the mousedown event for the resize handle.
 *
 * @param e The mouse event.
 */
function onResizeStart(e: MouseEvent) {
    isResizing.value = true;
    startX = e.clientX;
    startWidth = sidebarWidth.value;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
}

useEventListener(document, 'mousemove', (e: MouseEvent) => {
    if (!isResizing.value) return;
    const delta = e.clientX - startX;
    sidebarWidth.value = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWidth + delta));
});

useEventListener(document, 'mouseup', () => {
    if (!isResizing.value) return;
    isResizing.value = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
});
</script>

<template>
    <div class="relative flex flex-row">
        <div class="bg-background z-20 flex h-full flex-col gap-1 border-r p-1">
            <template v-for="(tabProps, tab) in TABS" :key="tab">
                <!-- <hr v-if="tabProps.devider" /> -->
                <div class="flex-1" v-if="tabProps.devider" />
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button
                            :class="
                                cn(
                                    'hover:bg-primary hover:text-primary-foreground flex aspect-square',
                                    'size-11.5 justify-center bg-transparent p-4',
                                    {
                                        'text-accent! hover:bg-accent/10': state.tab === tab,
                                    },
                                )
                            "
                            @click="() => onTabClick(tab as Tab)"
                        >
                            <component
                                :is="tabProps.icon"
                                :size="30"
                                :strokeWidth="1.5"
                                class="size-7.5!"
                            />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" class="text-sm">
                        {{ tabProps.title }}
                    </TooltipContent>
                </Tooltip>
            </template>
        </div>
        <div
            v-if="state.tab !== null"
            class="bg-background absolute top-0 left-full z-30 h-full border-r lg:relative lg:left-0"
            :style="{ width: sidebarWidth + 'px' }"
        >
            <component :is="TABS[state.tab].content" />
            <div
                class="fade-in animate-in absolute top-0 left-full h-full w-dvw bg-black/50 duration-50 lg:hidden"
                @click="state.tab = null"
            />
            <div
                class="hover:bg-border absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize bg-transparent transition-colors"
                :class="{ 'bg-border': isResizing }"
                @mousedown="onResizeStart"
            >
                <GripVerticalIcon
                    :size="12"
                    class="text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity hover:opacity-100"
                    :class="{ 'opacity-100': isResizing }"
                />
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped></style>
