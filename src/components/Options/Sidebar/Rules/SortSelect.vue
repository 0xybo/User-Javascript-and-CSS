<script setup lang="ts">
import TooltipWrapper from '@/components/TooltipWrapper.vue';
import Button from '@/components/ui/button/Button.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectGroup from '@/components/ui/select/SelectGroup.vue';
import SelectLabel from '@/components/ui/select/SelectLabel.vue';
import { useSettings } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation';
import { useSort } from '@/lib/options/sortRules';
import { cn } from '@/lib/tailwind';
import { SelectItem, SelectTrigger } from 'reka-ui';

const t = useTranslation();
const settings = useSettings();
const sort = useSort();
</script>

<template>
    <Select v-model="settings.sortBy">
        <SelectTrigger>
            <TooltipWrapper
                :content="t('COMMON.SORT.TITLE') + ' : ' + sort[settings.sortBy].label"
                class="text-sm"
                side="right"
            >
                <Button
                    class="hover:bg-primary hover:text-primary-foreground border-none bg-transparent p-2"
                >
                    <component :is="sort[settings.sortBy].icon" class="size-5.25!" />
                </Button>
            </TooltipWrapper>
        </SelectTrigger>
        <SelectContent class="[&>div]:p-0" side="right">
            <SelectGroup>
                <SelectLabel>{{ t('COMMON.SORT.TITLE') }}</SelectLabel>
            </SelectGroup>
            <SelectItem
                v-for="(sortProps, sortName) in sort"
                :key="sortName"
                :value="sortName"
                :class="
                    cn(
                        'hover:bg-secondary flex flex-row items-center gap-2 px-3 py-2 outline-none',
                        {
                            'bg-secondary': sortName === settings.sortBy,
                            'cursor-pointer': sortName !== settings.sortBy,
                        },
                    )
                "
            >
                <component :is="sortProps.icon" />
                {{ sortProps.label }}
            </SelectItem>
        </SelectContent>
    </Select>
</template>
