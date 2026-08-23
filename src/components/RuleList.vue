<script setup lang="ts">
import { IRule } from '@/lib/storage/types';
import RuleListItem from './RuleListItem.vue';

const props = defineProps<{ rules: IRule[]; openedRuleId?: string }>();
const emits = defineEmits<{
    change: [IRule, boolean];
    open: [IRule];
}>();

/**
 * Handles the change event for a rule list item. It emits a 'change' event with the rule and its
 * new value.
 *
 * @param rule - The rule that has changed.
 * @param value - The new value of the rule (true for enabled, false for disabled
 */
function onRuleListItemChange(rule: IRule, value: boolean) {
    emits('change', rule, value);
}

/**
 * Handles the open event for a rule list item. It emits an 'open' event with the rule that was
 * opened.
 *
 * @param rule - The rule that was opened.
 */
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
