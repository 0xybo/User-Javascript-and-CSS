import { IRule } from './storage/types';

/**
 * Splits a raw pattern string into an array of pattern objects, each containing the raw pattern,
 * the normalized pattern, and a boolean indicating whether the pattern is inverted (i.e., starts
 * with '-' or '!').
 *
 * @param raw - The raw pattern string to split, which may contain multiple patterns separated by
 * commas or semicolons.
 * @returns An array of pattern objects, each containing the raw pattern, the normalized pattern,
 * and a boolean indicating whether the pattern is inverted.
 */
function splitPatterns(raw: string): { raw: string; pattern: string; invert: boolean }[] {
    return raw
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((raw) => {
            const invert = raw.startsWith('-') || raw.startsWith('!');
            const pattern = invert ? raw.slice(1).trim() : raw;
            return { raw, pattern, invert };
        });
}

/**
 * Checks if a given pattern string is valid according to the expected format for URL patterns.
 *
 * @param pattern - The pattern string to validate.
 * @returns A boolean indicating whether the pattern is valid.
 */
export function isValidPattern(pattern: string): boolean {
    if (!pattern) return false;
    if (pattern === '<all_urls>') return true;
    // basic validation: scheme://host/path where scheme is http|https|file|ftp|*
    // host can be '*' or '*.domain' or hostname; path must start with '/'
    const matches = pattern.match(/^([*]|https?|file|ftp):\/\/([^/]+)(\/.*)$/);
    if (!matches) return false;
    const host = matches[2].replace(/^www./, '');
    // host rules: '*' or '*.example.com' or 'example.com' or IP
    if (host === '*') return true;
    if (/^\*\.[^./]+(\.[^./]+)*$/.test(host)) return true;
    if (/^[^./]+\.[^./]+/.test(host) || /^[\d.]+$/.test(host) || host === 'localhost') return true;
    return false;
}

/**
 * Converts a URL pattern string into a corresponding regular expression for matching URLs.
 *
 * @param p - The URL pattern string to convert.
 * @returns A RegExp object that can be used to match URLs against the given pattern.
 * @throws An error if the provided pattern is invalid.
 */
export function patternToRegex(p: string): RegExp {
    if (p === '<all_urls>') return /^https?:\/\/.+/i;
    const m = p.match(/^([*]|https?|file|ftp):\/\/([^/]+)(\/.*)$/);
    if (!m) throw new Error('Invalid pattern');
    const scheme = m[1] === '*' ? 'https?:' : m[1] + ':';
    let host = m[2];
    const path = m[3];

    // host -> regex
    if (host === '*') host = '.*';
    else if (host.startsWith('*.')) host = '(?:[^/]+\\.)' + host.slice(2).replace(/\./g, '\\.');
    else host = host.replace(/\./g, '\\.');

    // path: convert * to .* and escape other chars
    const escPath = path.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\\\*/g, '.*');
    const regexStr = `^${scheme}//${host}${escPath}$`;
    return new RegExp(regexStr, 'i');
}

/**
 * Matches a given URL string against a specified URL pattern, returning a boolean indicating
 * whether the URL matches the pattern.
 *
 * @param urlStr - The URL string to match against the pattern.
 * @param pattern - The URL pattern to match the URL against.
 * @returns A boolean indicating whether the URL matches the specified pattern.
 */
export function matchUrlAgainstPattern(urlStr: string, pattern: string): boolean {
    try {
        const url = new URL(urlStr);
        // normalize file scheme: URL for file has protocol 'file:'
        if (pattern === '<all_urls>')
            return /^https?:\/\//i.test(urlStr) || url.protocol === 'file:';
        if (!isValidPattern(pattern)) return false;
        const re = patternToRegex(pattern);
        return re.test(urlStr);
    } catch {
        return false;
    }
}

/**
 * Filters an array of rules based on whether they match a given URL, returning only the rules that
 * match the URL according to their specified patterns. Rules with empty patterns are considered
 * to match all URLs.
 *
 * @param rules - The array of rules to filter, each containing a 'patterns' property.
 * @param url - The URL string to match against the rules' patterns.
 * @returns An array of rules that match the specified URL.
 */
export function matchRuleByUrl(rule: IRule, url: string): boolean {
    const patterns = splitPatterns(rule.patterns);
    let positiveMatched = false;
    for (const pattern of patterns) {
        if (!isValidPattern(pattern.pattern)) continue;
        const matched = matchUrlAgainstPattern(url, pattern.pattern);
        if (pattern.invert && matched) return false; // explicit exclusion
        if (!pattern.invert && matched) positiveMatched = true;
    }
    return positiveMatched;
}

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

    // Logger.debug(`Filtering rules for URL: ${url} (normalized: ${nornamlizedUrl})`);
    // Logger.debug(`Total rules: ${rules.length}`);
    // Logger.debug(
    //     `Matching rules: ${rules.filter((rule) => rule.patterns === '' || matchRuleByUrl(rule, nornamlizedUrl)).length}`,
    // );

    return rules.filter((rule) => rule.patterns === '' || matchRuleByUrl(rule, nornamlizedUrl));
}

/**
 * Retrieves the name of a given rule, falling back to the last pattern or the rule's ID if no name
 * is specified.
 *
 * @param rule - The rule object from which to retrieve the name.
 * @returns The name of the rule, or the last pattern, or the rule's ID if no name is specified.
 */
export function getName(rule: IRule): string {
    return rule.name || splitPatterns(rule.patterns).pop()?.pattern || rule.id;
}
