<script setup lang="ts">
import { useState } from '@/composables/useOptions';
import { Tab } from '@/lib/options';
import { cn } from '@/lib/utils';
import {
    BoltIcon,
    ClipboardListIcon,
    Grid2X2PlusIcon,
    LucideIcon,
    MessageCircleHeartIcon,
    PackagePlusIcon,
} from 'lucide-vue-next';
import Button from '../ui/button/Button.vue';
import Tooltip from '../ui/tooltip/Tooltip.vue';
import TooltipContent from '../ui/tooltip/TooltipContent.vue';
import TooltipTrigger from '../ui/tooltip/TooltipTrigger.vue';
import About from './Tabs/About.vue';
import ExternalModules from './Tabs/ExternalModules.vue';
import PersonnalModules from './Tabs/PersonnalModules.vue';
import Rules from './Tabs/Rules.vue';
import Settings from './Tabs/Settings.vue';

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
    [Tab.ExternalModules]: {
        icon: PackagePlusIcon,
        content: ExternalModules,
        title: i18n.t('COMMON_EXTERNAL_MODULES'),
    },
    [Tab.PersonnalModules]: {
        icon: Grid2X2PlusIcon,
        content: PersonnalModules,
        title: i18n.t('COMMON_PERSONNAL_MODULES'),
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
    <div class="flex flex-row">
        <div class="flex h-full flex-col gap-1 border-r p-1">
            <template v-for="(tabProps, tab) in TABS" :key="tab">
                <hr v-if="tabProps.devider" />
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
                            <component :is="tabProps.icon" :size="30" :strokeWidth="1.5" class="size-7.5!" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" class="text-sm">
                        {{ tabProps.title }}
                    </TooltipContent>
                </Tooltip>
            </template>
        </div>
        <div v-if="state.tab !== null" class="h-full w-72 border-r">
            <component :is="TABS[state.tab].content" />
        </div>
    </div>
</template>

<style lang="css" scoped></style>
