<script setup lang="ts">
import { i18n } from '#imports';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import Label from '@/components/ui/label/Label.vue';
import Popover from '@/components/ui/popover/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import { useState } from '@/composables/options/useState';
import { useStorage } from '@/composables/useStorage';
import { Tab } from '@/lib/options/tab';
import { ModuleT, RuleT } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind';
import { EllipsisVerticalIcon } from 'lucide-vue-next';
import { PopoverClose } from 'reka-ui';

const state = useState();
const storage = useStorage();

/**
 * Handles the change event for a module checkbox in the modules menu.
 *
 * @param checked The new checked state of the checkbox. Can be true, false, or 'indeterminate'.
 * @param module The module associated with the checkbox that was changed.
 */
function onCheckboxChange(checked: boolean | 'indeterminate', module: ModuleT) {
    if (typeof checked === 'boolean' && checked) (state.rule.item as RuleT).modules.push(module.id);
    else
        (state.rule.item as RuleT).modules.splice(
            (state.rule.item as RuleT).modules.findIndex((id) => id === module.id),
            1,
        );
}
</script>

<template>
    <Popover>
        <PopoverTrigger as-child>
            <Button class="h-full">
                <Badge
                    :class="
                        cn('pointer-events-none aspect-square font-mono', {
                            'bg-accent text-accent-foreground': (state.rule.item as RuleT).modules
                                .length,
                        })
                    "
                    variant="outline"
                >
                    {{ (state.rule.item as RuleT).modules.length }}
                </Badge>
                {{ i18n.t('COMMON_MODULES') }}
                <EllipsisVerticalIcon />
            </Button>
        </PopoverTrigger>
        <PopoverContent
            side="bottom"
            align="end"
            class="w-min min-w-(--reka-popover-trigger-width) px-0 py-2"
        >
            <template v-if="storage.modules.length">
                <Label
                    v-for="module of storage.modules"
                    :key="module.id"
                    class="group hover:bg-secondary text-foreground flex cursor-pointer flex-row items-center gap-2 px-4 py-2 font-normal"
                >
                    <Checkbox
                        :model-value="(state.rule.item as RuleT).modules.includes(module.id)"
                        @update:model-value="(checked) => onCheckboxChange(checked, module)"
                        class="border-accent group-hover: data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground size-5 border-2"
                    />
                    <div class="w-full">
                        {{ module.name || module.package }}
                    </div>
                </Label>
            </template>
            <div v-else class="flex flex-col gap-4 px-4 py-2 text-base">
                {{ i18n.t('RULES_NO_MODULES') }}
                <PopoverClose as-child>
                    <Button
                        @click="state.tab = Tab.Modules"
                        variant="ghost"
                        class="bg-accent text-accent-foreground w-full"
                    >
                        {{ i18n.t('RULES_ADD_MODULE') }}
                    </Button>
                </PopoverClose>
            </div>
        </PopoverContent>
    </Popover>
</template>
