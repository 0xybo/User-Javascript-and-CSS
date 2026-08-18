<script setup lang="ts">
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { BadgeAlertIcon, BadgeCheckIcon } from 'lucide-vue-next';

import TooltipWrapper from '@/components/TooltipWrapper.vue';
import UrlMatchPopup from './UrlMatchPopup.vue';

import useState from '@/composables/options/useState.ts';
import useTranslation from '@/composables/useTranslation.ts';
import { useWindowSize } from '@vueuse/core';

// import { fixPattern, joinPatterns, splitPatterns } from '@/lib/rules.ts';
import usePatterns from '@/composables/options/usePatterns.ts';
import { ItemType } from '@/lib/storage/types';
import { cn } from '@/lib/tailwind.ts';
import { PopoverAnchor, type PointerDownOutsideEvent } from 'reka-ui';
import { computed, ref, useTemplateRef } from 'vue';

const state = useState();
const t = useTranslation();

const patternGroupRef = useTemplateRef('patternGroup');
const popoverRef = useTemplateRef('popover');
const windowSize = useWindowSize();

const popoverMaxHeight = computed(
    () =>
        windowSize.height.value -
        (patternGroupRef.value?.getBoundingClientRect().bottom || 0) -
        16 +
        'px',
);

const isForcedOpen = ref(false);

const patterns = usePatterns();

/**
 * Forces the URL match popup to open, cancelling any pending close. This is used when the user
 * clicks the checkmark icon to open the popup, so it stays open even if the pointer leaves the
 * trigger area.
 */
function onBadgeClick(e: MouseEvent) {
    e.stopPropagation();

    isForcedOpen.value = !isForcedOpen.value;
}

/**
 * Closes the URL match popup if the pointer down event occurred outside of the trigger and popup
 * elements. This is used to close the popup when the user clicks outside of it.
 *
 * @param e The pointer down outside event.
 */
function onOutsideClick(e: PointerDownOutsideEvent) {
    if (patternGroupRef.value?.contains(e.target as Node)) return;
    if (popoverRef.value?.contains(e.target as Node)) return;

    isForcedOpen.value = false;
}
</script>

<template>
    <Popover :open="isForcedOpen">
        <PopoverAnchor as-child>
            <div class="relative flex h-min flex-2" v-if="state.rule.item.type === ItemType.Rule">
                <div ref="patternGroup" class="relative flex w-full">
                    <InputGroup
                        :class="
                            cn('border-primary h-min w-full shadow-sm', {
                                'bg-primary': isForcedOpen,
                            })
                        "
                    >
                        <TooltipWrapper :content="t('EDITOR.URL_PATTERN_TOOLTIP')">
                            <InputGroupAddon @click="onBadgeClick">
                                <BadgeCheckIcon
                                    :size="24"
                                    class="text-success/75 size-6 cursor-pointer"
                                    :stroke-width="1.5"
                                    v-if="patterns.isValid()"
                                />
                                <BadgeAlertIcon
                                    :size="24"
                                    class="text-destructive size-6 cursor-pointer"
                                    :stroke-width="1.5"
                                    v-else
                                />
                            </InputGroupAddon>
                        </TooltipWrapper>
                        <div class="relative w-full">
                            <InputGroupAddon class="absolute top-0 left-0 pt-1! pb-0">
                                <Label class="text-muted p-0 text-xs">
                                    {{ t('EDITOR.URL_PATTERN') }}
                                </Label>
                            </InputGroupAddon>
                            <InputGroupInput
                                :placeholder="t('EDITOR.URL_PATTERN_EXAMPLE')"
                                class="h-11 pt-6 pb-2! pl-3! shadow-none"
                                v-model="state.rule.item.patterns"
                            />
                        </div>
                    </InputGroup>
                </div>
            </div>
        </PopoverAnchor>
        <PopoverContent
            align="start"
            avoid-collisions
            :style="{ maxHeight: popoverMaxHeight }"
            class="w-(--reka-popover-trigger-width) overflow-y-auto"
            @pointer-down-outside="onOutsideClick"
        >
            <div ref="popover">
                <UrlMatchPopup />
            </div>
        </PopoverContent>
    </Popover>
</template>
