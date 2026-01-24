import { type Component, i18n } from '#imports';
import {
    ArrowDownAZIcon,
    ArrowUpAZIcon,
    CalendarArrowDownIcon,
    ClockArrowDownIcon,
} from 'lucide-vue-next';
import { RuleT, SortBy } from '../storage/types';

export const SORT: {
    [K in SortBy]: {
        label: string;
        icon: Component;
        method: (a: RuleT, b: RuleT) => number;
    };
} = {
    [SortBy.NameDescending]: {
        label: i18n.t('COMMON_SORT_NAME_DESC'),
        icon: ArrowDownAZIcon,
        method: (a: RuleT, b: RuleT) => (a.name || '').localeCompare(b.name || ''),
    },
    [SortBy.NameAscending]: {
        label: i18n.t('COMMON_SORT_NAME_ASC'),
        icon: ArrowUpAZIcon,
        method: (a: RuleT, b: RuleT) => -(a.name || '').localeCompare(b.name || ''),
    },
    [SortBy.Created]: {
        label: i18n.t('COMMON_SORT_CREATED'),
        icon: CalendarArrowDownIcon,
        method: (a: RuleT, b: RuleT) => a.created - b.created,
    },
    [SortBy.Updated]: {
        label: i18n.t('COMMON_SORT_UPDATED'),
        icon: ClockArrowDownIcon,
        method: (a: RuleT, b: RuleT) => a.updated - b.updated, // FIX Doesn't work
    },
};
