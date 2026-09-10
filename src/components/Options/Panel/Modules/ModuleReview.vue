<script setup lang="ts">
import { computed } from '#imports';
import useState from '@/composables/options/useState';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation';
import { IModule, type IRule } from '@/lib/storage/types';

const state = useState();
const props = defineProps<{ module: IModule }>();
const storage = useStorage();
const t = useTranslation();

/** The rules that reference this module in their `modules` list. */
const usedBy = computed(() =>
    storage.rules.filter((rule) => rule.modules.includes(props.module.id)),
);

function switchToRule(rule: IRule) {
    const draft = storage.getDraftFromItem(rule) || storage.createDraftFromItem(rule);

    state.switchDraft(draft);
}
</script>

<template>
    <div v-if="usedBy.length" class="bg-muted/30 flex flex-row items-center border-t p-3">
        <span class="text-muted-foreground mr-2 text-xs font-medium tracking-wider uppercase">
            {{ t('MODULES.USED_BY') }}
        </span>
        <template v-for="rule in usedBy" :key="rule.id">
            <div
                class="flex cursor-pointer items-center gap-2 rounded-md p-0 text-sm hover:underline"
                @click.prevent.stop="switchToRule(rule)"
            >
                <span class="truncate">{{ rule.name || rule.id }}</span>
            </div>
            <span v-if="rule !== usedBy[usedBy.length - 1]" class="text-muted-foreground">
                ,&nbsp;
            </span>
        </template>
    </div>
</template>
