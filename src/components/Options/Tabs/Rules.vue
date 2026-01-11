<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectGroup from '@/components/ui/select/SelectGroup.vue';
import SelectLabel from '@/components/ui/select/SelectLabel.vue';
import Tooltip from '@/components/ui/tooltip/Tooltip.vue';
import TooltipContent from '@/components/ui/tooltip/TooltipContent.vue';
import TooltipTrigger from '@/components/ui/tooltip/TooltipTrigger.vue';
import { useConfirm } from '@/composables/useConfirm';
import { useState } from '@/composables/useOptions';
import { useStorage } from '@/composables/useStorage';
import { Draft, Rule, SortBy } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { ArrowDownAZIcon, ArrowUpAZIcon, BookPlus, CalendarArrowDownIcon, ClockArrowDownIcon } from 'lucide-vue-next';
import { SelectItem, SelectTrigger } from 'reka-ui';

const SORT: {
    [K in SortBy]: {
        label: string;
        icon: Component;
        method: (a: Rule, b: Rule) => number;
    };
} = {
    [SortBy.NameDescending]: {
        label: i18n.t('COMMON_SORT_NAME_DESC'),
        icon: ArrowDownAZIcon,
        method: (a: Rule, b: Rule) => (a.name || '').localeCompare(b.name || ''),
    },
    [SortBy.NameAscending]: {
        label: i18n.t('COMMON_SORT_NAME_ASC'),
        icon: ArrowUpAZIcon,
        method: (a: Rule, b: Rule) => -(a.name || '').localeCompare(b.name || ''),
    },
    [SortBy.Created]: {
        label: i18n.t('COMMON_SORT_CREATED'),
        icon: CalendarArrowDownIcon,
        method: (a: Rule, b: Rule) => a.created - b.created,
    },
    [SortBy.Updated]: {
        label: i18n.t('COMMON_SORT_UPDATED'),
        icon: ClockArrowDownIcon,
        method: (a: Rule, b: Rule) => a.updated - b.updated,
    },
};

const state = useState();
const storage = useStorage();
const rules = storage.rules;
const sortBy = computed({
    get: () => storage.settings.sortBy,
    set: (sort: SortBy) => {
        storage.settings.sortBy = sort;
        storage.save();
    },
});
const confirm = useConfirm();

async function newRule() {
    if (storage.hasDraft(Draft.Rule) && !(await confirm.open(i18n.t('DRAFT_ALREADY_EXISTS')))) return;

    state.rule = storage.newDraft(Draft.Rule, true);
}
</script>

<template>
    <div class="flex flex-col">
        <div class="flex min-h-8 flex-row justify-between px-4 py-2 text-xs select-none">
            <div class="flex items-center tracking-widest uppercase">
                {{ i18n.t('COMMON_RULES') }} ({{ rules.length }})
            </div>
            <Button class="text-foreground flex h-min flex-row gap-1 p-0" variant="link" @click="newRule">
                <BookPlus :size="16" />
                {{ i18n.t('COMMON_NEW_RULES') }}
            </Button>
        </div>
        <div class="flex flex-row gap-2 border-b px-4 py-3">
            <Input type="text" :placeholder="i18n.t('COMMON_FIND')" class="border-secondary" />
            <Select v-model="sortBy">
                <SelectTrigger>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button
                                class="hover:bg-primary hover:text-primary-foreground border-none bg-transparent p-2"
                            >
                                <component :is="SORT[sortBy].icon" class="size-5.25!" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent class="text-sm" side="right">
                            {{ i18n.t('COMMON_SORT') }} : {{ SORT[sortBy].label }}
                        </TooltipContent>
                    </Tooltip>
                </SelectTrigger>
                <SelectContent class="shadow [&>div]:p-0">
                    <SelectGroup>
                        <SelectLabel>{{ i18n.t('COMMON_SORT') }}</SelectLabel>
                    </SelectGroup>
                    <SelectItem
                        v-for="(sortProps, sort) in SORT"
                        :key="sort"
                        :value="sort"
                        :class="
                            cn('hover:bg-secondary flex flex-row items-center gap-2 px-3 py-2 outline-none', {
                                'bg-secondary': sort === sortBy,
                                'cursor-pointer': sort !== sortBy,
                            })
                        "
                    >
                        <component :is="sortProps.icon" />
                        {{ sortProps.label }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div class="flex flex-1 flex-col"></div>
    </div>
</template>

<style lang="css" scoped></style>
