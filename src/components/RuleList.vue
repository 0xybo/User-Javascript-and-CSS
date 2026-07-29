<script setup lang="ts">
import { IRule } from '@/lib/storage/types';
import RuleListItem from './RuleListItem.vue';

const props = defineProps<{ rules: IRule[]; openedRuleId?: string }>();
const emits = defineEmits<{
    change: [IRule, boolean];
    open: [IRule];
}>();

function onRuleListItemChange(rule: IRule, value: boolean) {
    emits('change', rule, value);
}

function onRuleListItemOpen(rule: IRule) {
    emits('open', rule);
}
</script>

<template>
    <RuleListItem
        v-for="rule of props.rules"
        :key="rule.id"
        :rule="rule"
        @change="(value) => onRuleListItemChange(rule, value)"
        @open="() => onRuleListItemOpen(rule)"
        :opened="props.openedRuleId === rule.id"
    />
</template>
