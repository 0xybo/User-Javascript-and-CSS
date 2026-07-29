import { browser } from '#imports';
import { Logger } from '../logger';
import { IRule } from '../storage/types';

export class Injector {
    private registeredIds = new Set<string>();
    private hasUserScripts = false;

    constructor() {
        this.hasUserScripts = !!browser.userScripts;
    }

    isRegistered(ruleId: string): boolean {
        return this.registeredIds.has(`ujc-${ruleId}`);
    }

    async registerScript(rule: IRule) {
        if (!rule.script.compiled) return;

        const id = `ujc-${rule.id}`;

        if (this.registeredIds.has(id)) {
            await this.unregisterScript(rule.id);
        }

        if (this.hasUserScripts) {
            try {
                await browser.userScripts.register([
                    {
                        id,
                        matches: this.parsePatterns(rule.patterns),
                        js: [{ code: rule.script.compiled }],
                        runAt: rule.script.atStart ? 'document_start' : 'document_end',
                        world: 'MAIN',
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

        // Fallback: use scripting.executeScript (primary method for Firefox)
        this.registeredIds.add(id);
        Logger.debug(`Registered script (fallback): ${id}`);
    }

    async injectScript(tabId: number, rule: IRule) {
        if (!rule.script.compiled) return;
        if (this.hasUserScripts && this.registeredIds.has(`ujc-${rule.id}`)) return;

        const frames = rule.script.recursive ? ['ALL_FRAMES' as const] : [0];

        const code = rule.script.compiled;
        const world = rule.script.isolated ? 'ISOLATED' : 'MAIN';

        try {
            if (world === 'MAIN') {
                await browser.scripting.executeScript({
                    target: { tabId, frameIds: frames as unknown as number[] },
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
                    target: { tabId, frameIds: frames as unknown as number[] },
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
        const id = `ujc-${ruleId}`;
        if (this.hasUserScripts) {
            try {
                await browser.userScripts.unregister({ ids: [id] });
            } catch {
                // ignore
            }
        }
        this.registeredIds.delete(id);
    }

    async unregisterAll() {
        const ids = [...this.registeredIds];
        if (this.hasUserScripts) {
            for (const id of ids) {
                try {
                    await browser.userScripts.unregister({ ids: [id] });
                } catch {
                    // ignore
                }
            }
        }
        this.registeredIds.clear();
    }

    private parsePatterns(patterns: string): string[] {
        if (!patterns) return ['http://*/*', 'https://*/*'];
        return patterns
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .filter((p) => !p.startsWith('-') && !p.startsWith('!'))
            .map((p) => (p === '<all_urls>' ? '*://*/*' : p));
    }
}
