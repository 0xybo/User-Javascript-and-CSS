import type { Component } from '#imports';
import useTranslation from '@/composables/useTranslation';
import {
    ArrowDownAZIcon,
    ArrowUpAZIcon,
    CalendarArrowDownIcon,
    ClockArrowDownIcon,
} from 'lucide-vue-next';
import { computed } from 'vue';
import { IRule, SortBy } from '../storage/types';

type SortRule = {
    [K in SortBy]: {
        label: string;
        icon: Component;
        method: (a: IRule, b: IRule) => number;
    };
};

export function useSort() {
    const t = useTranslation();
    return computed(
        () =>
            ({
                [SortBy.NameDescending]: {
                    label: t('COMMON.SORT.NAME_DESC'),
                    icon: ArrowDownAZIcon,
                    method: (a: IRule, b: IRule) => (a.name || '').localeCompare(b.name || ''),
                },
                [SortBy.NameAscending]: {
                    label: t('COMMON.SORT.NAME_ASC'),
                    icon: ArrowUpAZIcon,
                    method: (a: IRule, b: IRule) => -(a.name || '').localeCompare(b.name || ''),
                },
                [SortBy.Created]: {
                    label: t('COMMON.SORT.CREATED'),
                    icon: CalendarArrowDownIcon,
                    method: (a: IRule, b: IRule) => a.created - b.created,
                },
                [SortBy.Updated]: {
                    label: t('COMMON.SORT.UPDATED'),
                    icon: ClockArrowDownIcon,
                    method: (a: IRule, b: IRule) => a.updated - b.updated, // FIX Doesn't work
                },
            }) as SortRule,
    ).value;
}
