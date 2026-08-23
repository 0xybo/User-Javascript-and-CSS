import { Patterns } from './pattern';
import { IRule } from './storage/types';

/**
 * Whether the extension is allowed to inject scripts or styles into a page URL. Only http(s)
 * pages covered by the manifest host permissions accept injections; restricted schemes
 * (`chrome://`, `chrome-extension://`, `about:`, `edge://`, ...) and the Chrome Web Store make
 * every scripting call fail with a permission error.
 *
 * @param url The URL string to test, if known.
 * @returns True when injections may be attempted into this URL.
 */
export function isInjectableUrl(url?: string | null): boolean {
    if (!url) return false;

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return false;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const host = parsed.hostname.toLowerCase();
    if (host === 'chromewebstore.google.com') return false;
    if (host === 'chrome.google.com' && parsed.pathname.startsWith('/webstore')) return false;

    return true;
}

/**
 * Filters an array of rules based on whether they match a given URL, returning only the rules that
 * match the URL according to their specified patterns. Rules with empty patterns are considered
 * to match all URLs. URLs the extension cannot inject into (restricted schemes, Chrome Web Store)
 * never match any rule.
 *
 * @param rules - The array of rules to filter, each containing a 'patterns' property.
 * @param url - The URL string to match against the rules' patterns.
 * @returns An array of rules that match the specified URL.
 */
export function filterRulesByUrl(rules: IRule[], url: string) {
    if (!isInjectableUrl(url)) return [];

    const nornamlizedUrl = url.replace('://www.', '://');

    return rules.filter((rule) => {
        if (rule.patterns === '') return true;

        const patterns = new Patterns(rule);
        return patterns.matchUrl(nornamlizedUrl);
    });
}

/**
 * Retrieves the name of a given rule, falling back to the last pattern or the rule's ID if no name
 * is specified.
 *
 * @param rule - The rule object from which to retrieve the name.
 * @returns The name of the rule, or the last pattern, or the rule's ID if no name is specified.
 */
export function getName(rule: IRule): string {
    // return rule.name || splitPatterns(rule.patterns).pop()?.pattern || rule.id;
    return rule.name || Patterns.extractName(rule) || rule.id;
}
