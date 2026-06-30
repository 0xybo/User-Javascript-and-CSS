import { browser } from '#imports';
import { RuleT } from '../storage/types';
import { Logger } from '../logger';

export class Injector {
    private registeredIds = new Set<string>();

    isRegistered(ruleId: string): boolean {
        return this.registeredIds.has(`ujc-${ruleId}`);
    }

    async registerScript(rule: RuleT) {
        if (!rule.script.compiled) return;

        const id = `ujc-${rule.id}`;

        if (this.registeredIds.has(id)) {
            await this.unregisterScript(rule.id);
        }

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
        } catch (e) {
            Logger.warning(`userScripts registration failed for ${id}:`, e);
        }
    }

    async injectFallback(tabId: number, rule: RuleT) {
        if (!rule.script.compiled) return;

        try {
            await browser.scripting.executeScript({
                target: { tabId },
                code: rule.script.compiled,
                world: 'MAIN',
            });
        } catch (e) {
            Logger.warning(`Fallback injection failed for tab ${tabId}:`, e);
        }
    }

    async unregisterScript(ruleId: string) {
        const id = `ujc-${ruleId}`;
        try {
            await browser.userScripts.unregister({ ids: [id] });
        } catch {
            // ignore
        }
        this.registeredIds.delete(id);
    }

    async unregisterAll() {
        const ids = [...this.registeredIds];
        for (const id of ids) {
            try {
                await browser.userScripts.unregister({ ids: [id] });
            } catch {
                // ignore
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
