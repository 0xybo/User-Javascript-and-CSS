<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import TooltipWrapper from '@/components/TooltipWrapper.vue';

import {
    BadgeAlertIcon,
    BadgeCheckIcon,
    ChevronDownIcon,
    PlusIcon,
    Trash2Icon,
} from 'lucide-vue-next';

import useTranslation from '@/composables/useTranslation';

import usePatterns from '@/composables/options/usePatterns';
import useState from '@/composables/options/useState';
import { PatternScheme, type Pattern } from '@/lib/pattern';
import { ref } from 'vue';

enum Tab {
    Simple = 'simple',
    Advanced = 'advanced',
}

const state = useState();
const patterns = usePatterns();
const t = useTranslation();
const tab = ref(Tab.Simple);

/**
 * Returns the translated label for a given pattern method.
 *
 * @param method The pattern method.
 * @returns The translated label for the pattern method.
 */
function getPatternMethodLabel(method: PatternScheme | undefined) {
    switch (method) {
        case PatternScheme.All:
            return t('URL_MATCH.SIMPLE.SCHEME_ALL');
        case PatternScheme.Https:
            return t('URL_MATCH.SIMPLE.SCHEME_HTTPS');
        case PatternScheme.Http:
            return t('URL_MATCH.SIMPLE.SCHEME_HTTP');
        default:
            return t('URL_MATCH.SIMPLE.SCHEME_UNRECOGNIZED');
    }
}

/**
 * Adds a new simple pattern to the list of patterns. The new pattern is initialized with default
 * values.
 */
function addSimple() {
    // patterns.push(getDefaultPattern());
    patterns.addExample();
}

/**
 * Updates the domain of a given pattern based on the selected value from the domain select
 * dropdown.
 *
 * @param pattern The pattern object to update.
 * @param value The selected value from the domain select dropdown. Can be 'all',
 * 'subdomains', or null.
 */
function onPatternDomainSelect(pattern: Pattern, value: string | null) {
    switch (value) {
        case 'all':
            pattern.domain = '*';
            break;
        case 'subdomains':
            pattern.domain = '*.' + pattern.domain.replace(/^\*\./, '');
            break;
    }
}

/**
 * Updates the path of a given pattern based on the selected value from the path select dropdown.
 *
 * @param pattern The pattern object to update.
 * @param value The selected value from the path select dropdown. Can be 'all' or null.
 */
function onPatternPathSelectUpdate(pattern: Pattern, value: string | null) {
    switch (value) {
        case 'all':
            pattern.path = '/*';
            break;
    }
}
</script>

<template>
    <div class="flex h-full flex-col gap-3 text-sm">
        <span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {{ t('URL_MATCH.TITLE') }}
        </span>

        <div class="flex flex-col flex-wrap gap-3">
            <Tabs v-model="tab" class="w-full min-w-60">
                <TabsList class="bg-background grid w-full grid-cols-2">
                    <TabsTrigger :value="Tab.Simple" class="data-[state=active]:bg-primary">{{
                        t('URL_MATCH.TAB_SIMPLE')
                    }}</TabsTrigger>
                    <TabsTrigger :value="Tab.Advanced" class="data-[state=active]:bg-primary">{{
                        t('URL_MATCH.TAB_ADVANCED')
                    }}</TabsTrigger>
                </TabsList>

                <TabsContent :value="Tab.Simple" class="flex flex-col gap-3 overflow-y-auto">
                    <Card
                        v-for="(pattern, i) in patterns"
                        :key="i"
                        class="bg-background text-foreground border-none"
                    >
                        <CardHeader class="relative">
                            <CardTitle class="flex items-center gap-2">
                                <BadgeCheckIcon
                                    v-if="pattern.isValid"
                                    class="text-success size-4 shrink-0"
                                />
                                <BadgeAlertIcon v-else class="text-destructive size-4 shrink-0" />
                                {{ pattern.pattern }}
                            </CardTitle>
                            <CardAction>
                                <TooltipWrapper :content="t('COMMON.REMOVE')">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="text-muted-foreground hover:bg-primary absolute top-0 right-4 size-7 cursor-pointer transition-[background-color]"
                                        :title="t('URL_MATCH.LIST.REMOVE')"
                                        @click="patterns.removeAt(i)"
                                    >
                                        <Trash2Icon class="text-destructive" />
                                    </Button>
                                </TooltipWrapper>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <div class="flex items-center gap-2">
                                <Select v-model="pattern.scheme">
                                    <SelectTrigger class="border-primary w-30 min-w-30">
                                        <span>{{ getPatternMethodLabel(pattern.scheme) }}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            :value="PatternScheme.Unrecognized"
                                            disabled
                                            v-if="pattern.scheme === PatternScheme.Unrecognized"
                                        >
                                            {{ t('URL_MATCH.SIMPLE.SCHEME_UNRECOGNIZED') }}
                                        </SelectItem>
                                        <SelectItem :value="PatternScheme.All">{{
                                            t('URL_MATCH.SIMPLE.SCHEME_ALL')
                                        }}</SelectItem>
                                        <SelectItem :value="PatternScheme.Https">{{
                                            t('URL_MATCH.SIMPLE.SCHEME_HTTPS')
                                        }}</SelectItem>
                                        <SelectItem :value="PatternScheme.Http">{{
                                            t('URL_MATCH.SIMPLE.SCHEME_HTTP')
                                        }}</SelectItem>
                                    </SelectContent>
                                </Select>
                                ://
                                <InputGroup class="border-primary shadow-sm">
                                    <InputGroupInput
                                        v-model="pattern.domain"
                                        :placeholder="t('URL_MATCH.SIMPLE.DOMAIN_PLACEHOLDER')"
                                        class="border-primary shadow-none"
                                    />
                                    <InputGroupAddon class="pl-1.5" align="inline-end">
                                        <!-- <Select
                                            @update:model-value="
                                                onPatternDomainSelectUpdate.bind(null, pattern)
                                            "
                                        >
                                            <SelectTrigger class="border-none shadow-none" />
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    {{ t('URL_MATCH.SIMPLE.DOMAIN_WILDCARD') }}
                                                </SelectItem>
                                                <SelectItem value="subdomains">
                                                    {{ t('URL_MATCH.SIMPLE.SUBDOMAINS') }}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select> -->
                                        <DropdownMenu>
                                            <DropdownMenuTrigger as-child>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    class="text-muted-foreground hover:bg-primary size-7 cursor-pointer transition-[background-color]"
                                                >
                                                    <ChevronDownIcon class="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                class="bg-background border-primary shadow-sm"
                                                align="end"
                                            >
                                                <DropdownMenuItem
                                                    @click="onPatternDomainSelect(pattern, 'all')"
                                                >
                                                    {{ t('URL_MATCH.SIMPLE.DOMAIN_WILDCARD') }}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    @click="
                                                        onPatternDomainSelect(pattern, 'subdomains')
                                                    "
                                                >
                                                    {{ t('URL_MATCH.SIMPLE.SUBDOMAINS') }}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </InputGroupAddon>
                                </InputGroup>
                                <InputGroup class="border-primary shadow-sm">
                                    <InputGroupInput
                                        v-model="pattern.path"
                                        :placeholder="t('URL_MATCH.SIMPLE.PATH_PLACEHOLDER')"
                                        class="border-primary shadow-none"
                                    />
                                    <InputGroupAddon class="pl-1.5" align="inline-end">
                                        <!-- <Select 
                                            @update:model-value="
                                                onPatternPathSelectUpdate.bind(null, pattern)
                                            "
                                        >
                                            <SelectTrigger class="border-none shadow-none" />
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    {{ t('URL_MATCH.SIMPLE.PATH_WILDCARD') }}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select> -->
                                        <DropdownMenu>
                                            <DropdownMenuTrigger as-child>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    class="text-muted-foreground hover:bg-primary size-7 cursor-pointer transition-[background-color]"
                                                >
                                                    <ChevronDownIcon class="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                class="bg-background border-primary shadow-sm"
                                                align="end"
                                            >
                                                <DropdownMenuItem
                                                    @click="
                                                        onPatternPathSelectUpdate(pattern, 'all')
                                                    "
                                                >
                                                    {{ t('URL_MATCH.SIMPLE.PATH_WILDCARD') }}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                            <div v-if="pattern.error" class="text-destructive pt-2 text-xs">
                                {{ t(`URL_MATCH.ERRORS.${pattern.error}`) }}
                            </div>
                            <div
                                v-if="
                                    pattern.path &&
                                    !pattern.path.endsWith('*') &&
                                    !state.rule.item.autoFixPatterns
                                "
                                class="text-warning pt-2 text-xs"
                            >
                                {{ t('URL_MATCH.WARNING.STRICT_MATCH') }}
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="secondary" size="sm" class="self-start" @click="addSimple">
                        <PlusIcon class="size-4" />
                        {{ t('URL_MATCH.SIMPLE.ADD') }}
                    </Button>
                </TabsContent>

                <TabsContent :value="Tab.Advanced" class="flex flex-row flex-wrap gap-3">
                    <Card class="bg-background text-foreground min-w-60 flex-1 border-none">
                        <CardContent class="flex flex-col gap-2">
                            <span class="text-xs italic">
                                {{ t('URL_MATCH.ADVANCED.RULES_TITLE') }}
                            </span>
                            <span class="text-xs">• {{ t('URL_MATCH.ADVANCED.RULE_SCHEME') }}</span>
                            <span class="text-xs">• {{ t('URL_MATCH.ADVANCED.RULE_DOMAIN') }}</span>
                            <span class="text-xs">
                                • {{ t('URL_MATCH.ADVANCED.RULE_DELIMITER') }}</span
                            >
                            <div class="mt-1 flex flex-col gap-0.5">
                                <span class="text-success text-xs font-medium">
                                    {{ t('URL_MATCH.ADVANCED.OK_TITLE') }}
                                </span>
                                <code class="font-mono text-xs text-inherit">
                                    {{ t('URL_MATCH.ADVANCED.OK_EXAMPLE_1') }}
                                </code>
                                <code class="font-mono text-xs text-inherit">
                                    {{ t('URL_MATCH.ADVANCED.OK_EXAMPLE_2') }}
                                </code>
                                <code class="font-mono text-xs text-inherit">
                                    {{ t('URL_MATCH.ADVANCED.OK_EXAMPLE_3') }}
                                </code>
                            </div>
                            <div class="mt-1 flex flex-col gap-0.5">
                                <span class="text-destructive text-xs font-medium">
                                    {{ t('URL_MATCH.ADVANCED.BAD_TITLE') }}
                                </span>
                                <code class="font-mono text-xs text-inherit">
                                    {{ t('URL_MATCH.ADVANCED.BAD_EXAMPLE_1') }}
                                </code>
                                <code class="font-mono text-xs text-inherit">
                                    {{ t('URL_MATCH.ADVANCED.BAD_EXAMPLE_2') }}
                                </code>
                                <code class="font-mono text-xs text-inherit">
                                    {{ t('URL_MATCH.ADVANCED.BAD_EXAMPLE_3') }}
                                </code>
                            </div>
                        </CardContent>
                    </Card>

                    <div class="flex min-w-60 flex-1 flex-col gap-1">
                        <Card class="bg-background text-foreground border-none">
                            <CardContent>
                                <div class="flex items-center gap-2">
                                    <Checkbox
                                        id="url-match-autofix"
                                        v-model="state.rule.item.autoFixPatterns"
                                        class="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                                    />
                                    <Label for="url-match-autofix" class="cursor-pointer">
                                        {{ t('URL_MATCH.ADVANCED.AUTO_FIX') }}
                                    </Label>
                                </div>
                                <div class="text-muted-foreground pt-2 text-xs italic">
                                    {{ t('URL_MATCH.ADVANCED.AUTO_FIX_DESC') }}
                                </div>
                                <!-- <div
                                    v-if="state.rule.item.autoFixPatterns"
                                    class="mt-2 flex flex-col gap-1"
                                >
                                    <span class="text-xs font-medium">{{
                                        t('URL_MATCH.ADVANCED.AUTO_FIX_RESULT')
                                    }}</span>
                                    <div
                                        v-for="(pattern, i) in patterns"
                                        :key="i"
                                        :class="
                                            cn('flex items-center gap-2', {
                                                'italic opacity-50':
                                                    pattern.autoFix() === pattern.pattern,
                                            })
                                        "
                                    >
                                        <BadgeCheckIcon
                                            v-if="pattern.isValid"
                                            class="text-success/75 size-4 shrink-0"
                                        />
                                        <BadgeAlertIcon
                                            v-else
                                            class="text-destructive size-4 shrink-0"
                                        />
                                        <code
                                            class="text-foreground truncate pt-0.5 font-mono text-xs"
                                        >
                                            {{ pattern.autoFix() }}
                                        </code>
                                    </div>
                                </div> -->
                            </CardContent>
                        </Card>

                        <Card class="bg-background text-foreground min-w-60 flex-1 border-none">
                            <CardHeader>
                                <CardTitle>{{
                                    t(
                                        state.rule.item.autoFixPatterns
                                            ? 'URL_MATCH.ADVANCED.AUTO_FIX_RESULT'
                                            : 'URL_MATCH.LIST.TITLE',
                                    )
                                }}</CardTitle>
                            </CardHeader>
                            <CardContent class="flex flex-col gap-2">
                                <div
                                    v-if="patterns.length === 0"
                                    class="text-muted-foreground text-xs italic"
                                >
                                    {{ t('URL_MATCH.LIST.NONE') }}
                                </div>
                                <div
                                    v-for="(pattern, i) in patterns"
                                    class="flex flex-col gap-2"
                                    :key="i"
                                >
                                    <div class="flex items-center gap-2">
                                        <BadgeCheckIcon
                                            v-if="pattern.isValid"
                                            class="text-success/75 size-4 shrink-0"
                                        />
                                        <BadgeAlertIcon
                                            v-else
                                            class="text-destructive size-4 shrink-0"
                                        />
                                        <div
                                            :key="i"
                                            class="group bg-muted/50 flex w-full items-center gap-2 rounded-md px-2 py-1.5"
                                        >
                                            <div class="relative flex min-w-0 flex-1 flex-col">
                                                <code
                                                    class="text-foreground truncate font-mono text-xs"
                                                >
                                                    {{
                                                        state.rule.item.autoFixPatterns
                                                            ? pattern.isValid
                                                                ? pattern.autoFix()
                                                                : pattern.pattern
                                                            : pattern.pattern
                                                    }}
                                                </code>
                                                <code
                                                    v-if="
                                                        state.rule.item.autoFixPatterns &&
                                                        pattern.isValid &&
                                                        pattern.autoFix() !== pattern.pattern
                                                    "
                                                    class="text-muted absolute top-1/2 right-0 -translate-y-1/2 truncate font-mono text-xs"
                                                >
                                                    FIXED
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="pattern.error" class="text-destructive text-xs">
                                        {{ t(`URL_MATCH.ERRORS.${pattern.error}`) }}
                                    </div>
                                    <div
                                        v-if="
                                            pattern.path &&
                                            !pattern.path.endsWith('*') &&
                                            !state.rule.item.autoFixPatterns
                                        "
                                        class="text-warning text-xs"
                                    >
                                        {{ t('URL_MATCH.WARNING.STRICT_MATCH') }}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    </div>
</template>
