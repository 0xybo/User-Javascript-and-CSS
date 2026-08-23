import { browser } from '#imports';
import { Logger } from '../logger';
import { IRule } from '../storage/types';

/**
 * How a rule's CSS is currently applied inside a tab: through the `scripting` API as a
 * user-origin stylesheet, or programmatically as a `<style>` element appended to the DOM.
 */
type InjectionMode = 'api' | 'dom';

interface InjectionKey {
    id: string;
    code: string;
    origin: 'USER';
    mode: InjectionMode;
}

/**
 * Applies (creates or updates) the `<style>` element carrying a rule's compiled CSS. Runs
 * inside the page through `scripting.executeScript`; the isolated world is enough since
 * `<style>` elements apply document-wide regardless of the world they are created from.
 *
 * Mirrors the code embedded by `buildStyleScript` in `./injector` for registered user
 * scripts — keep both in sync.
 *
 * @param styleId The DOM element id of the style element (`ujc-css-<ruleId>`).
 * @param code The compiled CSS to apply.
 */
function applyStyleElement(styleId: string, code: string) {
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        style.setAttribute('data-source', 'User JavaScript and CSS');
    }
    style.textContent = code;
    // Appending an existing node moves it last so the sheet wins the author cascade.
    (document.head || document.documentElement).appendChild(style);
}

/**
 * Removes the `<style>` element previously applied by {@link applyStyleElement}.
 *
 * @param styleId The DOM element id of the style element (`ujc-css-<ruleId>`).
 */
function removeStyleElement(styleId: string) {
    document.getElementById(styleId)?.remove();
}

export class TabManager {
    private tabInjections = new Map<number, Map<string, InjectionKey>>();

    /**
     * Injects a rule's compiled CSS through the `scripting.insertCSS` API as a user-origin
     * stylesheet (top frame). Used when the rule's style has the `injected` flag enabled;
     * otherwise the programmatic path (`injectStyleElement`) applies instead.
     *
     * @param tabId The identifier of the tab to inject into.
     * @param rule The rule whose compiled style must be applied.
     */
    async injectCSS(tabId: number, rule: IRule) {
        if (!rule.style.compiled) return;

        const existing = this.tabInjections.get(tabId)?.get(rule.id);
        if (existing?.code === rule.style.compiled && existing.mode === 'api') return;
        if (existing) await this.removeCSS(tabId, rule.id);

        const key: InjectionKey = {
            id: rule.id,
            code: rule.style.compiled,
            origin: 'USER',
            mode: 'api',
        };

        try {
            await browser.scripting.insertCSS({
                target: { tabId },
                css: key.code,
                origin: key.origin,
            });
            this.track(tabId, key);
        } catch (e) {
            Logger.warning(`CSS injection failed for tab ${tabId}:`, e);
        }
    }

    /**
     * Injects a rule's compiled CSS as a `<style>` DOM element (programmatic injection).
     * The element is keyed by rule id so repeated calls update it in place instead of
     * stacking duplicates on SPA navigations or live edits.
     *
     * @param tabId The identifier of the tab to inject into.
     * @param rule The rule whose compiled style must be applied.
     */
    async injectStyleElement(tabId: number, rule: IRule) {
        if (!rule.style.compiled) return;

        const existing = this.tabInjections.get(tabId)?.get(rule.id);
        if (existing?.code === rule.style.compiled && existing.mode === 'dom') return;
        if (existing) await this.removeCSS(tabId, rule.id);

        const key: InjectionKey = {
            id: rule.id,
            code: rule.style.compiled,
            origin: 'USER',
            mode: 'dom',
        };

        try {
            await browser.scripting.executeScript({
                target: { tabId },
                func: applyStyleElement,
                args: [`ujc-css-${rule.id}`, key.code],
                world: 'ISOLATED',
            });
            this.track(tabId, key);
        } catch (e) {
            Logger.warning(`Style element injection failed for tab ${tabId}:`, e);
        }
    }

    /**
     * Removes the injected CSS of a rule from a tab, whichever path it was applied with:
     * `removeCSS` for API-injected stylesheets, style element removal for programmatic ones.
     *
     * @param tabId The identifier of the tab to clean.
     * @param ruleId The identifier of the rule whose CSS must be removed.
     */
    async removeCSS(tabId: number, ruleId: string) {
        const tabMap = this.tabInjections.get(tabId);
        const key = tabMap?.get(ruleId);
        if (!tabMap || !key) return;

        try {
            if (key.mode === 'api') {
                await browser.scripting.removeCSS({
                    target: { tabId },
                    css: key.code,
                    origin: key.origin,
                });
            } else {
                await browser.scripting.executeScript({
                    target: { tabId },
                    func: removeStyleElement,
                    args: [`ujc-css-${ruleId}`],
                    world: 'ISOLATED',
                });
            }
        } catch (e) {
            Logger.warning(`CSS removal failed for tab ${tabId}:`, e);
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

    /**
     * Records an injection key for a tab, creating the per-tab map when needed.
     *
     * @param tabId The identifier of the tab the key was injected into.
     * @param key The injection key to track.
     */
    private track(tabId: number, key: InjectionKey) {
        const tabMap = this.tabInjections.get(tabId) || new Map();
        tabMap.set(key.id, key);
        this.tabInjections.set(tabId, tabMap);
    }
}
