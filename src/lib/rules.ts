import { Patterns } from './pattern';
import { IRule } from './storage/types';

/**
 * Filters an array of rules based on whether they match a given URL, returning only the rules that
 * match the URL according to their specified patterns. Rules with empty patterns are considered
 * to match all URLs.
 *
 * @param rules - The array of rules to filter, each containing a 'patterns' property.
 * @param url - The URL string to match against the rules' patterns.
 * @returns An array of rules that match the specified URL.
 */
export function filterRulesByUrl(rules: IRule[], url: string) {
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
