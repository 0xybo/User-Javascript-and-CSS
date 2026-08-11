import { browser, defineBackground } from '#imports';
import {
    applyBadgeColor,
    setupBadge,
    updateActiveTabBadge,
    updateBadgeForTab,
} from '@/lib/background/badge';
import { Injector } from '@/lib/background/injector';
import { setupSyncScheduler } from '@/lib/background/sync-scheduler';
import { TabManager } from '@/lib/background/tab-manager';
import { Logger } from '@/lib/logger';
import { filterRulesByUrl } from '@/lib/rules';
import { storage } from '@/lib/storage';
import { IRule } from '@/lib/storage/types';
import { parse } from '@/lib/storage/utils';
import { isEmptyCompiledScript } from '@/lib/utils';
import { PlainObject } from '@/types/json';
import { useThrottleFn } from '@vueuse/core';

export default defineBackground({
    main: () => {
        (async () => {
            const tabManager = new TabManager();
            const injector = new Injector();

            storage.onLoaded(async () => {
                // Automatic cloud synchronization (alarm-based)
                setupSyncScheduler();

                // Badge on the extension icon (number of matching rules)
                await setupBadge();

                // Sync initial injections
                await syncInjections();
            });

            // Register userScripts for all rules
            for (const rule of storage.rules) {
                if (rule.enabled && isEmptyCompiledScript(rule.script.compiled)) {
                    await injector.registerScript(rule);
                }
            }

            // Storage changes from other contexts → re-sync
            browser.storage.local.onChanged.addListener(
                useThrottleFn(
                    async () => {
                        const data = parse(
                            (await browser.storage.local.get()) as unknown as PlainObject,
                        );
                        const rules = (data.rules || []) as IRule[];

                        await injector.unregisterAll();
                        for (const rule of rules) {
                            if (rule.enabled && rule.script.compiled) {
                                await injector.registerScript(rule);
                            }
                        }

                        const tabs = await browser.tabs.query({});
                        for (const tab of tabs) {
                            if (!tab.id || !tab.url) continue;
                            await tabManager.removeAllForTab(tab.id);
                            const matching = filterRulesByUrl(rules, tab.url).filter(
                                (r) => r.enabled,
                            );
                            for (const rule of matching) {
                                if (rule.style.compiled) {
                                    await tabManager.injectCSS(tab.id, rule);
                                }
                            }
                        }

                        // Rules or badge setting may have changed
                        await applyBadgeColor();
                        await updateActiveTabBadge();
                    },
                    500,
                    true,
                ),
            );

            // Tab navigation → re-inject CSS (userScripts persist)
            browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
                if (changeInfo.status !== 'complete' || !tab.url || !tab.id) return;

                const matching = filterRulesByUrl(storage.rules as IRule[], tab.url).filter(
                    (r) => r.enabled,
                );

                for (const rule of matching) {
                    if (rule.style.compiled) {
                        await tabManager.injectCSS(tabId, rule);
                    }
                    if (rule.script.compiled && !injector.isRegistered(rule.id)) {
                        await injector.injectFallback(tabId, rule);
                    }
                }

                await updateBadgeForTab(tabId, tab.url);
            });

            // Tab closed → clean up injections
            browser.tabs.onRemoved.addListener(async (tabId) => {
                await tabManager.removeAllForTab(tabId);
            });

            // Tab focused → update the badge for the new active tab
            browser.tabs.onActivated.addListener(async ({ tabId }) => {
                const tab = await browser.tabs.get(tabId);
                await updateBadgeForTab(tabId, tab.url);
            });

            // Messages from content script → re-inject for SPA navigation
            browser.runtime.onMessage.addListener(async (message, sender) => {
                if (!sender.tab?.id) return;
                if (message.type !== 'page:open' && message.type !== 'page:update') return;

                const tabId = sender.tab.id;
                const url = sender.tab.url || message.url;
                await tabManager.removeAllForTab(tabId);

                const matching = filterRulesByUrl(storage.rules as IRule[], url).filter(
                    (r) => r.enabled,
                );

                for (const rule of matching) {
                    if (rule.style.compiled) {
                        await tabManager.injectCSS(tabId, rule);
                    }
                    if (rule.script.compiled && !injector.isRegistered(rule.id)) {
                        await injector.injectFallback(tabId, rule);
                    }
                }

                await updateBadgeForTab(tabId, url);
            });

            async function syncInjections() {
                const tabs = await browser.tabs.query({});
                for (const tab of tabs) {
                    if (!tab.id || !tab.url) continue;
                    await tabManager.removeAllForTab(tab.id);
                    const matching = filterRulesByUrl(storage.rules as IRule[], tab.url).filter(
                        (r) => r.enabled,
                    );
                    for (const rule of matching) {
                        if (rule.style.compiled) {
                            await tabManager.injectCSS(tab.id, rule);
                        }
                    }
                }
            }

            Logger.info('Background service worker started');
        })();
    },
});
