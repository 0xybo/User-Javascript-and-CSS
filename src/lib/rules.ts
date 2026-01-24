import { RuleT } from './storage/types';

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

export function matchRuleByUrl(rule: RuleT, url: string): boolean {
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

export function filterRulesByUrl(rules: RuleT[], url: string) {
    const nornamlizedUrl = url.replace('://www.', '://');
    return rules.filter((rule) => rule.patterns === '' || matchRuleByUrl(rule, nornamlizedUrl));
}

export function getName(rule: RuleT): string {
    return rule.name || splitPatterns(rule.patterns).pop()?.pattern || rule.id;
}
