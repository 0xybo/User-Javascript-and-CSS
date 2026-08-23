import { browser } from '#imports';
import { Logger } from '../logger';
import { IRule } from '../storage/types';

/** Prefix of the user script ids registered for rule scripts. */
const SCRIPT_ID_PREFIX = 'ujc-';
/** Prefix of the user script ids registered for rule styles (programmatic CSS injection). */
export const STYLE_ID_PREFIX = 'ujc-css-';

const scriptId = (ruleId: string) => `${SCRIPT_ID_PREFIX}${ruleId}`;
const styleId = (ruleId: string) => `${STYLE_ID_PREFIX}${ruleId}`;

/**
 * Match patterns of a rule, split between inclusions and exclusions as expected by
 * `userScripts.register`.
 */
interface PatternSet {
    matches: string[];
    excludeMatches: string[];
}

/**
 * Splits a rule's raw pattern string into `matches` / `excludeMatches` match patterns.
 * Exclusions are prefixed with `-` or `!`; `<all_urls>` is normalized to the match-pattern
 * syntax. When no inclusion remains, all http(s) pages are matched.
 *
 * @param patterns The raw pattern string of a rule (separated by `,`, `;` or newlines).
 * @returns The include and exclude match patterns.
 */
function parsePatterns(patterns: string): PatternSet {
    const matches: string[] = [];
    const excludeMatches: string[] = [];

    for (const part of (patterns || '').split(/[;,\n]/)) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        const excluded = trimmed.startsWith('-') || trimmed.startsWith('!');
        const raw = trimmed.replace(/^[-!]\s*/, '');
        const normalized = raw === '<all_urls>' ? '*://*/*' : raw;
        (excluded ? excludeMatches : matches).push(normalized);
    }

    if (!matches.length) matches.push('http://*/*', 'https://*/*');
    return { matches, excludeMatches };
}

/**
 * Builds the source of the companion user script that programmatically injects a rule's
 * compiled CSS as a `<style>` element (original v3.1.2 behavior): appended to the document
 * root at `document_start`, re-appended once the body exists, and deduplicated by element
 * id so re-registrations never stack duplicates.
 *
 * Mirrors `applyStyleElement` in `./tab-manager` used for live tabs — keep both in sync.
 *
 * @param ruleId The identifier of the rule owning the CSS.
 * @param css The compiled CSS to embed.
 * @returns The full source of the style-injecting user script.
 */
export function buildStyleScript(ruleId: string, css: string): string {
    return `;(() => {
    let style = document.getElementById(${JSON.stringify(styleId(ruleId))});
    if (!style) {
        style = document.createElement('style');
        style.id = ${JSON.stringify(styleId(ruleId))};
        style.setAttribute('data-source', 'User JavaScript and CSS');
    }
    style.textContent = ${JSON.stringify(css)};
    document.documentElement.appendChild(style);

    new MutationObserver((mutations, observer) => {
        if (document.body) {
            observer.disconnect();
            document.documentElement.appendChild(style);
        }
    }).observe(document.documentElement, { childList: true });
})();`;
}

export class Injector {
    private registeredIds = new Set<string>();
    private hasUserScripts = false;

    constructor() {
        this.hasUserScripts = !!browser.userScripts;
    }

    /**
     * Whether the rule's script is registered as a user script (or emulated by the
     * per-tab fallback when the `userScripts` API is unavailable).
     *
     * @param ruleId The identifier of the rule.
     */
    isRegistered(ruleId: string): boolean {
        return this.registeredIds.has(scriptId(ruleId));
    }

    /**
     * Whether the rule's script is persistently registered through the `userScripts` API
     * and therefore injected by the browser itself. Rules running through the per-tab
     * fallback report `false` so callers keep injecting them on every navigation.
     *
     * @param ruleId The identifier of the rule.
     */
    isPersistentlyRegistered(ruleId: string): boolean {
        return this.hasUserScripts && this.registeredIds.has(scriptId(ruleId));
    }

    /**
     * Registers a rule's compiled script as a persistent user script honoring every script
     * option: `isolated` selects the `USER_SCRIPT` world over `MAIN`, `recursive` enables
     * all frames, and `atStart` switches the run time to `document_start`. Falls back to
     * per-tab `scripting.executeScript` injections when the API is unavailable.
     *
     * @param rule The rule whose script must be registered.
     */
    async registerScript(rule: IRule) {
        if (!rule.script.compiled) return;

        const id = scriptId(rule.id);
        if (this.registeredIds.has(id)) await this.unregisterScript(rule.id);

        if (this.hasUserScripts) {
            try {
                const { matches, excludeMatches } = parsePatterns(rule.patterns);
                await browser.userScripts.register([
                    {
                        id,
                        matches,
                        excludeMatches,
                        js: [{ code: rule.script.compiled }],
                        allFrames: rule.script.recursive,
                        runAt: rule.script.atStart ? 'document_start' : 'document_end',
                        world: rule.script.isolated ? 'USER_SCRIPT' : 'MAIN',
                    },
                ]);
                this.registeredIds.add(id);
                Logger.debug(`Registered userScript: ${id}`);
                return;
            } catch (e) {
                Logger.warning(`userScripts registration failed for ${id}, using fallback:`, e);
                this.hasUserScripts = false;
            }
        }

        // Fallback: per-tab scripting.executeScript injections (see injectScript).
        this.registeredIds.add(id);
        Logger.debug(`Registered script (fallback): ${id}`);
    }

    /**
     * Registers a rule's companion user script injecting its compiled CSS as a `<style>`
     * element (programmatic path, used when the style's `injected` flag is off). Styles
     * with the flag on are applied per tab through the scripting API instead and must not
     * be registered here.
     *
     * @param rule The rule whose style must be registered.
     */
    async registerStyleScript(rule: IRule) {
        if (!rule.style.compiled || rule.style.injected) return;

        const id = styleId(rule.id);
        if (this.registeredIds.has(id)) await this.unregisterStyleScript(rule.id);

        if (this.hasUserScripts) {
            try {
                const { matches, excludeMatches } = parsePatterns(rule.patterns);
                await browser.userScripts.register([
                    {
                        id,
                        matches,
                        excludeMatches,
                        js: [{ code: buildStyleScript(rule.id, rule.style.compiled) }],
                        // Programmatic styles apply to every frame at document_start so they
                        // are present before the first paint, like the original extension.
                        allFrames: true,
                        runAt: 'document_start',
                    },
                ]);
                this.registeredIds.add(id);
                Logger.debug(`Registered style userScript: ${id}`);
                return;
            } catch (e) {
                Logger.warning(`userScripts style registration failed for ${id}:`, e);
                this.hasUserScripts = false;
            }
        }

        // Without the API there is no persistent registration: open tabs still receive the
        // style element through TabManager.injectStyleElement on every trigger.
        this.registeredIds.add(id);
        Logger.debug(`Registered style script (fallback): ${id}`);
    }

    /**
     * Injects a rule's compiled script into a tab through `scripting.executeScript`.
     * Honors every script option: `isolated` runs the code in the `ISOLATED` world instead
     * of the page's `MAIN` one, `recursive` targets all frames, and `atStart` asks for
     * immediate injection. Skipped when the script is already registered as a user script.
     *
     * @param tabId The identifier of the tab to inject into.
     * @param rule The rule whose script must be injected.
     */
    async injectScript(tabId: number, rule: IRule) {
        if (!rule.script.compiled) return;
        if (this.hasUserScripts && this.registeredIds.has(scriptId(rule.id))) return;

        const target = { tabId, allFrames: rule.script.recursive };
        const code = rule.script.compiled;
        const world = rule.script.isolated ? 'ISOLATED' : 'MAIN';

        try {
            if (world === 'MAIN') {
                await browser.scripting.executeScript({
                    target,
                    func: (code: string) => {
                        const script = document.createElement('script');
                        script.textContent = `(async () => { ${code} })()`;
                        (document.head || document.documentElement).appendChild(script);
                        script.remove();
                    },
                    args: [code],
                    world: 'MAIN',
                    injectImmediately: rule.script.atStart,
                });
            } else {
                await browser.scripting.executeScript({
                    target,
                    func: (code: string) => {
                        (0, eval)(`(async () => { ${code} })()`);
                    },
                    args: [code],
                    world: 'ISOLATED',
                    injectImmediately: rule.script.atStart,
                });
            }
        } catch (e) {
            Logger.warning(`Script injection failed for tab ${tabId}:`, e);
        }
    }

    async injectFallback(tabId: number, rule: IRule) {
        await this.injectScript(tabId, rule);
    }

    async unregisterScript(ruleId: string) {
        await this.unregister(scriptId(ruleId));
    }

    async unregisterStyleScript(ruleId: string) {
        await this.unregister(styleId(ruleId));
    }

    async unregisterAll() {
        await Promise.all([...this.registeredIds].map((id) => this.unregister(id)));
    }

    /**
     * Unregisters a single user script by id and forgets it locally. Missing registrations
     * are ignored so callers do not need to check first.
     *
     * @param id The user script id to unregister.
     */
    private async unregister(id: string) {
        if (this.hasUserScripts) {
            try {
                await browser.userScripts.unregister({ ids: [id] });
            } catch {
                // ignore — the script may not be registered
            }
        }
        this.registeredIds.delete(id);
    }
}
