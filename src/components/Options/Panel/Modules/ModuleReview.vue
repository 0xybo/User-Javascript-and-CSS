<script setup lang="ts">
import { computed } from '#imports';
import { useStorage } from '@/composables/useStorage';
import useTranslation from '@/composables/useTranslation';
import { IModule } from '@/lib/storage/types';

const props = defineProps<{ module: IModule }>();
const storage = useStorage();
const t = useTranslation();

/** The rules that reference this module in their `modules` list. */
const usedBy = computed(() => storage.rules.filter((rule) => rule.modules.includes(props.module.id)));
</script>

<template>
    <div v-if="usedBy.length" class="border-t bg-muted/30 p-3">
        <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
            {{ t('MODULES.USED_BY') }}
        </p>
        <ul class="flex flex-col gap-1">
            <li
                v-for="rule in usedBy"
                :key="rule.id"
                class="flex items-center gap-2 text-sm"
            >
                <span class="size-1.5 rounded-full bg-accent shrink-0" />
                <span class="truncate">{{ rule.name || rule.id }}</span>
            </li>
        </ul>
    </div>
</template>
