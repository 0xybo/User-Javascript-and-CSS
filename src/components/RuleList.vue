<script setup lang="ts">
import { RuleT } from '@/lib/storage/types';
import RuleListItem from './RuleListItem.vue';

const props = defineProps<{ rules: RuleT[]; openedRuleId?: string }>();
const emits = defineEmits<{
    change: [RuleT, boolean];
    open: [RuleT];
}>();

function onRuleListItemChange(rule: RuleT, value: boolean) {
    emits('change', rule, value);
}

function onRuleListItemOpen(rule: RuleT) {
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
