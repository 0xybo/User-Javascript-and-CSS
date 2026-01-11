<script setup lang="ts">
import InputGroup from '@/components/ui/input-group/InputGroup.vue';
import InputGroupAddon from '@/components/ui/input-group/InputGroupAddon.vue';
import InputGroupInput from '@/components/ui/input-group/InputGroupInput.vue';
import Label from '@/components/ui/label/Label.vue';
import { BadgeCheckIcon } from 'lucide-vue-next';
</script>

<template>
    <div class="flex w-full flex-row gap-1 border-b p-1">
        <InputGroup class="border-primary h-min">
            <InputGroupAddon class="absolute top-0 pt-1! pb-0 pl-2">
                <Label class="text-muted p-0 text-xs">
                    {{ i18n.t('EDITOR_RULE_NAME') }}
                </Label>
            </InputGroupAddon>
            <InputGroupInput :placeholder="i18n.t('EDITOR_RULE_NAME_EXAMPLE')" class="h-11 pt-6 pb-2!" />
        </InputGroup>
        <InputGroup class="border-primary h-min">
            <InputGroupAddon class="">
                <BadgeCheckIcon :size="24" class="text-success/75 size-6" :stroke-width="1.5" />
            </InputGroupAddon>
            <div class="relative w-full">
                <InputGroupAddon class="absolute top-0 left-0 pt-1! pb-0">
                    <Label class="text-muted p-0 text-xs">
                        {{ i18n.t('EDITOR_URL_PATTERN') }}
                    </Label>
                </InputGroupAddon>
                <InputGroupInput :placeholder="i18n.t('EDITOR_URL_PATTERN_EXAMPLE')" class="h-11 pt-6 pb-2! pl-3!" />
            </div>
        </InputGroup>
    </div>
</template>

<style lang="css" scoped></style>
