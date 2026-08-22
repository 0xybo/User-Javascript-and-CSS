<script setup lang="ts">
import { browser } from '#imports';
import Button from '@/components/ui/button/Button.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import useState from '@/composables/options/useState';
import useTranslation from '@/composables/useTranslation';
import { SettingsSection } from '@/lib/options/settings';
import { BrowserType, getBrowserType } from '@/lib/utils';
import {
    BookOpenIcon,
    ExternalLinkIcon,
    GithubIcon,
    HistoryIcon,
    ShoppingCartIcon,
} from 'lucide-vue-next';

const t = useTranslation();
const state = useState();

const manifest = browser.runtime.getManifest();

/** URL of the GitHub repository of this extension. */
const GITHUB_URL = 'https://github.com/0xybo/User-Javascript-and-CSS';
/** URL of the documentation of the original extension. */
const PREVIOUS_DOCS_URL = 'https://tenrabbits.github.io/user-js-css-docs/';
/** URL of the original extension on the Chrome Web Store. */
const PREVIOUS_STORE_URL =
    'https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld';

/**
 * Links related to this extension, each with a label, description, URL and icon.
 */
const LINKS = [
    {
        label: t('ABOUT.GITHUB'),
        description: t('ABOUT.GITHUB_DESCRIPTION'),
        href: GITHUB_URL,
        icon: GithubIcon,
    },
];

/**
 * Links to the previous version of the extension, each with a label, URL and icon.
 */
const PREVIOUS_LINKS = [
    { label: t('ABOUT.PREVIOUS_DOCS'), href: PREVIOUS_DOCS_URL, icon: BookOpenIcon },
    { label: t('ABOUT.PREVIOUS_STORE'), href: PREVIOUS_STORE_URL, icon: ShoppingCartIcon },
];

/**
 * The main open source libraries used by this extension.
 */
const CREDITS = [
    'Vue 3',
    'WXT',
    'Monaco Editor',
    'Tailwind CSS',
    'shadcn-vue (Reka UI)',
    'vue-i18n',
    'Zod',
    'lucide-vue-next',
    '@vueuse/core',
];

const browserType = getBrowserType();
const extensionsUrl =
    browserType === BrowserType.CHROMIUM ? 'chrome://extensions/' : 'about:addons';

/**
 * Switches to the Storage settings section, where data from the previous extension can be imported.
 */
function goToStorage() {
    state.switchSettingsSection(SettingsSection.Storage);
}
</script>

<template>
    <div class="flex h-full flex-col overflow-y-auto p-4">
        <div class="mb-4 flex flex-row items-center gap-3">
            <img :src="browser.runtime.getURL('/icon/128.png')" alt="" class="size-12 shrink-0" />
            <div class="min-w-0">
                <div class="truncate font-semibold">{{ t('EXTENSION.NAME') }}</div>
                <div class="text-muted-foreground text-xs">
                    {{ t('ABOUT.VERSION') }} {{ manifest.version }}
                </div>
            </div>
        </div>

        <div class="text-muted-foreground text-sm">
            {{ t('EXTENSION.DESCRIPTION') }}
        </div>

        <section class="mt-5 space-y-4">
            <h2 class="text-sm font-semibold tracking-wide uppercase">
                {{ t('ABOUT.LINKS') }}
            </h2>
            <Separator />
            <div class="space-y-2">
                <a
                    v-for="link in LINKS"
                    :key="link.label"
                    :href="link.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:bg-accent hover:text-accent-foreground flex flex-row items-center gap-3 rounded-md p-2 transition-colors"
                >
                    <component :is="link.icon" :size="20" class="shrink-0" />
                    <div class="min-w-0 flex-1">
                        <div class="text-sm font-medium">{{ link.label }}</div>
                        <div class="text-muted-foreground truncate text-xs">
                            {{ link.description }}
                        </div>
                    </div>
                    <ExternalLinkIcon :size="14" class="text-muted-foreground shrink-0" />
                </a>
            </div>
        </section>

        <section class="mt-5 space-y-4">
            <h2 class="text-sm font-semibold tracking-wide uppercase">
                {{ t('ABOUT.PREVIOUS_EXTENSION') }}
            </h2>
            <Separator />
            <p class="text-muted-foreground text-sm">
                {{ t('ABOUT.PREVIOUS_EXTENSION_DESCRIPTION') }}
            </p>
            <div class="space-y-2">
                <a
                    v-for="link in PREVIOUS_LINKS"
                    :key="link.label"
                    :href="link.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:bg-accent hover:text-accent-foreground flex flex-row items-center gap-3 rounded-md p-2 transition-colors"
                >
                    <component :is="link.icon" :size="20" class="shrink-0" />
                    <span class="text-sm font-medium">{{ link.label }}</span>
                    <ExternalLinkIcon :size="14" class="text-muted-foreground ml-auto shrink-0" />
                </a>
            </div>
            <div class="space-y-1">
                <div class="text-sm font-medium">{{ t('ABOUT.PREVIOUS_IMPORT') }}</div>
                <p class="text-muted-foreground text-xs">
                    {{ t('ABOUT.PREVIOUS_IMPORT_DESCRIPTION') }}
                </p>
                <Button
                    variant="outline"
                    class="text-muted-foreground mt-2 flex flex-row items-center gap-2"
                    @click="goToStorage"
                >
                    <HistoryIcon :size="16" />
                    {{ t('SETTINGS.IMPORT_LEGACY') }}
                </Button>
            </div>
        </section>

        <section class="mt-5 space-y-4">
            <h2 class="text-sm font-semibold tracking-wide uppercase">
                {{ t('ABOUT.ENABLE_SCRIPTS') }}
            </h2>
            <Separator />
            <p class="text-muted-foreground text-sm">
                {{ t('ABOUT.ENABLE_SCRIPTS_DESCRIPTION') }}
            </p>
            <ol class="list-decimal space-y-1 pl-5 text-sm">
                <li>
                    {{ t('ABOUT.ENABLE_SCRIPTS_STEP_1') }}
                    <a
                        :href="extensionsUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-accent inline-flex hover:underline"
                        @click.prevent="browser.tabs.create({ url: extensionsUrl })"
                    >
                        {{ extensionsUrl }}
                        <ExternalLinkIcon
                            :size="14"
                            class="text-muted-foreground ml-1 shrink-0 translate-y-1/4"
                        />
                    </a>
                </li>
                <li>{{ t('ABOUT.ENABLE_SCRIPTS_STEP_2') }}</li>
                <li>{{ t('ABOUT.ENABLE_SCRIPTS_STEP_3') }}</li>
            </ol>
        </section>

        <section class="mt-5 space-y-4">
            <h2 class="text-sm font-semibold tracking-wide uppercase">
                {{ t('ABOUT.CREDITS') }}
            </h2>
            <Separator />
            <p class="text-muted-foreground text-sm">
                {{ t('ABOUT.CREDITS_DESCRIPTION') }}
            </p>
            <ul class="flex flex-wrap gap-1.5">
                <li
                    v-for="credit in CREDITS"
                    :key="credit"
                    class="bg-muted text-foreground rounded-full px-3 py-1 text-xs"
                >
                    {{ credit }}
                </li>
            </ul>
        </section>
    </div>
</template>

<style lang="css" scoped></style>
