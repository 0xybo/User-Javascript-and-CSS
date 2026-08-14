import { browser } from '#imports';
import { IRule } from '../storage/types';

interface InjectionKey {
    id: string;
    code: string;
    origin: 'USER';
}

export class TabManager {
    private tabInjections = new Map<number, Map<string, InjectionKey>>();

    async injectCSS(tabId: number, rule: IRule) {
        if (!rule.style.compiled) return;

        const tabMap = this.tabInjections.get(tabId) || new Map();
        const existing = tabMap.get(rule.id);
        if (existing?.code === rule.style.compiled) return;

        if (existing) {
            try {
                await browser.scripting.removeCSS({
                    tabId,
                    codes: [existing.code],
                    origin: existing.origin,
                });
            } catch {
                // ignore
            }
        }

        const key: InjectionKey = {
            id: rule.id,
            code: rule.style.compiled,
            origin: 'USER',
        };

        try {
            await browser.scripting.insertCSS({
                tabId,
                codes: [key.code],
                origin: key.origin,
            });
            tabMap.set(rule.id, key);
            this.tabInjections.set(tabId, tabMap);
        } catch {
            // ignore
        }
    }

    async removeCSS(tabId: number, ruleId: string) {
        const tabMap = this.tabInjections.get(tabId);
        if (!tabMap) return;
        const key = tabMap.get(ruleId);
        if (!key) return;

        try {
            await browser.scripting.removeCSS({
                tabId,
                codes: [key.code],
                origin: key.origin,
            });
        } catch {
            // ignore
        }
        tabMap.delete(ruleId);
        if (tabMap.size === 0) this.tabInjections.delete(tabId);
    }

    async removeAllForTab(tabId: number) {
        const tabMap = this.tabInjections.get(tabId);
        if (!tabMap) return;

        for (const [ruleId] of tabMap) {
            await this.removeCSS(tabId, ruleId);
        }
    }

    /**
     * Removes the injected CSS of every rule in the given tab that is not part of the provided set
     * of keep rule ids. Used to drop styles of rules that no longer match (or were disabled).
     *
     * @param tabId The identifier of the tab to prune.
     * @param keepRuleIds The set of rule ids whose CSS must be kept.
     */
    async pruneForTab(tabId: number, keepRuleIds: Set<string>) {
        const tabMap = this.tabInjections.get(tabId);
        if (!tabMap) return;

        for (const [ruleId] of tabMap) {
            if (!keepRuleIds.has(ruleId)) await this.removeCSS(tabId, ruleId);
        }
    }

    async removeAll() {
        for (const [tabId] of this.tabInjections) {
            await this.removeAllForTab(tabId);
        }
    }
}
