<script setup lang="ts">
import type { Component } from '#imports';
import { i18n } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Tooltip from '@/components/ui/tooltip/Tooltip.vue';
import TooltipContent from '@/components/ui/tooltip/TooltipContent.vue';
import TooltipTrigger from '@/components/ui/tooltip/TooltipTrigger.vue';
import { useState } from '@/composables/options/useState';
import { Tab } from '@/lib/options';
import { cn } from '@/lib/tailwind';
import {
    BoltIcon,
    ClipboardListIcon,
    LucideIcon,
    MessageCircleHeartIcon,
    PackagePlusIcon,
} from 'lucide-vue-next';
import About from './Tabs/AboutTab.vue';
import Modules from './Tabs/ModulesTab.vue';
import Rules from './Tabs/RulesTab.vue';
import Settings from './Tabs/SettingsTab.vue';

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
        title: i18n.t('COMMON_RULES'),
    },
    [Tab.Modules]: {
        icon: PackagePlusIcon,
        content: Modules,
        title: i18n.t('COMMON_MODULES'),
    },
    [Tab.Settings]: {
        icon: BoltIcon,
        content: Settings,
        title: i18n.t('COMMON_SETTINGS'),
    },
    [Tab.About]: {
        icon: MessageCircleHeartIcon,
        content: About,
        title: i18n.t('COMMON_ABOUT'),
        devider: true,
    },
};

const state = useState();

function onTabClick(tab: Tab) {
    state.tab = state.tab === tab ? null : tab;
}
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
            class="bg-background absolute top-0 left-full z-100 h-full w-72 border-r lg:relative lg:left-0"
        >
            <component :is="TABS[state.tab].content" />
            <div
                class="fade-in animate-in absolute top-0 left-full h-full w-dvw bg-black/50 duration-50 lg:hidden"
                @click="state.tab = null"
            />
        </div>
    </div>
</template>

<style lang="css" scoped></style>
