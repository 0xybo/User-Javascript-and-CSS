import { reactive, watch, type Reactive } from 'vue';
import type { IRule } from './storage/types';

/**
 * Enumeration of the different methods that can be used to specify URL patterns in rules. The
 * methods correspond to the scheme of the URL (e.g., 'http', 'https', or 'all' for any scheme).
 */
export enum PatternScheme {
    All = 'all',
    Http = 'http',
    Https = 'https',
    Unrecognized = 'unrecognized',
}

/**
 * Error codes describing why a URL pattern is invalid. Mapped to localized messages in the UI.
 */

export enum UrlPatternErrorCode {
    EMPTY = 'EMPTY',
    NO_SCHEME = 'NO_SCHEME',
    INVALID_SCHEME = 'INVALID_SCHEME',
    NO_PATH = 'NO_PATH',
    MASKED_DOMAIN = 'MASKED_DOMAIN',
    INVALID_HOST = 'INVALID_HOST',
}

/**
 * Options used to build a URL pattern from the "simple" tab form.
 */
export interface PatternBuildOptions {
    /** The scheme for matching the URL. Can be 'all', 'https', or 'http'. */
    scheme: PatternScheme;
    /** The domain for matching the URL. */
    domain: string;
    /** Whether to match all subdomains. */
    subdomains: boolean;
    /** The path for matching the URL. */
    path: string;
    /** Whether to invert the match. */
    invert: boolean;
}

export class Pattern {
    pattern: string = '';
    scheme: PatternScheme = PatternScheme.All;
    domain: string = '';
    subdomains: boolean = false;
    path: string = '';
    invert: boolean = false;

    isValid: boolean = false;
    error: UrlPatternErrorCode | null = null;

    constructor(raw: string) {
        this.pattern = raw;

        const instance = reactive(this) as unknown as Pattern;

        watch(
            () => instance.pattern,
            () => instance.updateFromRaw(),
            { immediate: true, flush: 'sync' },
        );

        watch(
            () => [
                instance.scheme,
                instance.domain,
                instance.subdomains,
                instance.path,
                instance.invert,
            ],
            () => instance.updateFromParts(),
            { flush: 'sync' },
        );

        return instance;
    }

    private updateFromRaw() {
        const invert = this.pattern.startsWith('!');
        this.invert = invert;

        let pattern = invert ? this.pattern.slice(1) : this.pattern;

        if (pattern === '<all_urls>') {
            this.scheme = PatternScheme.All;
            this.domain = '*';
            this.subdomains = false;
            this.path = '/*';
            return;
        }

        const scheme = pattern.match(/^([*]|https?|file|ftp)/)?.[1] || PatternScheme.Unrecognized;
        const host = pattern.match(/^.+:\/\/([^/]+)/)?.[1] || '';
        const path = pattern.match(/^.+:\/\/[^/]+(.*)$/)?.[1] || '';

        switch (scheme) {
            case '*':
                this.scheme = PatternScheme.All;
                break;
            case 'https':
                this.scheme = PatternScheme.Https;
                break;
            case 'http':
                this.scheme = PatternScheme.Http;
                break;
            default:
                this.scheme = PatternScheme.Unrecognized;
        }

        this.domain = host;
        this.subdomains = host.startsWith('*.');
        this.path = path;

        this.evaluate();
    }

    private updateFromParts() {
        this.buildPattern();
    }

    private buildPattern(parsed: Partial<PatternBuildOptions> = {}) {
        parsed = {
            scheme: parsed.scheme ?? this.scheme,
            domain: parsed.domain ?? this.domain,
            subdomains: parsed.subdomains ?? this.subdomains,
            path: parsed.path ?? this.path,
            invert: parsed.invert ?? this.invert,
        };

        const invert = parsed.invert ? '!' : '';

        const method = this.scheme === PatternScheme.All ? '*' : this.scheme;

        let domain = this.domain.trim() || '*';
        if (!domain || domain === 'all') domain = '*';

        const subdomain = this.subdomains && !domain.startsWith('*.') ? '*.' : '';

        let path = this.path || '/';
        if (!path.startsWith('/')) path = `/${path}`;

        this.pattern = `${invert}${method}://${subdomain}${domain}${path}`;
    }

    private evaluate(): boolean {
        const invalidate = (code: UrlPatternErrorCode): boolean => {
            this.error = code;
            this.isValid = false;
            return false;
        };
        const validate = (): boolean => {
            this.error = null;
            this.isValid = true;
            return true;
        };

        this.error = null;

        if (!this.pattern) return invalidate(UrlPatternErrorCode.EMPTY);
        if (this.pattern === '<all_urls>') return validate();

        // basic validation: scheme://host/path where scheme is http|https|file|ftp|*
        // host can be '*' or '*.domain' or hostname; path must start with '/'
        const matches = this.pattern.match(/^([*]|https?|file|ftp):\/\/([^/]+)(\/.*)$/);
        if (!matches) return invalidate(UrlPatternErrorCode.NO_SCHEME);

        const host = matches[2];

        // host rules: '*' or '*.example.com' or 'example.com' or IP
        if (host === '*') return validate();

        if (/^\*\.[^./]+(\.[^./]+)*$/.test(host)) return validate(); // *.example.com

        if (/^[^./]+\.[^./]+/.test(host) || /^[\d.]+$/.test(host) || host === 'localhost')
            return validate();

        return invalidate(UrlPatternErrorCode.INVALID_HOST);
    }

    /**
     * Converts the current pattern into a regular expression that can be used to match URLs. The
     * conversion takes into account the scheme, host, and path of the pattern, and handles wildcards
     * appropriately.
     *
     * @param pattern - An optional pattern string to convert. If not provided, the current pattern
     * is used.
     * @returns A RegExp object that can be used to test URLs against the current pattern.
     * @throws An error if the pattern is invalid and cannot be converted to a regex.
     */
    toRegex(pattern?: string): RegExp {
        if (!pattern) pattern = this.pattern;

        if (pattern === '<all_urls>') return /^https?:\/\/.+/i;
        const m = pattern.match(/^([*]|https?|file|ftp):\/\/([^/]+)(\/.*)$/);
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
     * Tests whether a given URL string matches the current pattern. The method first attempts to
     * parse the URL and then checks it against the pattern's regex. If the pattern is '<all_urls>',
     * it checks for 'http' or 'https' schemes, or 'file' scheme.
     *
     * @param urlStr - The URL string to test against the current pattern.
     * @param autoFix - If true, the pattern will be automatically fixed before matching. This can
     * be useful if the pattern is not in a valid format.
     * @returns True if the URL matches the pattern; false otherwise.
     */
    matchUrl(urlStr: string, autoFix: boolean): boolean {
        let pattern = this.pattern;

        if (autoFix) pattern = this.autoFix();

        try {
            const url = new URL(urlStr);
            // normalize file scheme: URL for file has scheme 'file:'
            if (pattern === '<all_urls>')
                return /^https?:\/\//i.test(urlStr) || url.protocol === 'file:';

            if (!this.isValid) return false;

            const re = this.toRegex(pattern);
            const match = re.test(urlStr);

            if (this.invert) return !match;
            return match;
        } catch {
            return false;
        }
    }

    autoFix(): string {
        if (this.pattern === '<all_urls>') return this.pattern;

        let fixed = {
            scheme: this.scheme,
            domain: this.domain,
            path: this.path,
        };

        if (!fixed.scheme || fixed.scheme === PatternScheme.Unrecognized)
            fixed.scheme = PatternScheme.All;
        if (!fixed.domain) fixed.domain = '*';

        if (!fixed.path.endsWith('/*')) {
            if (fixed.path.endsWith('/')) fixed.path += '*';
            else fixed.path += '/*';
        }

        return `${this.invert ? '!' : ''}${fixed.scheme}://${fixed.domain}${fixed.path}`;
    }
}

export class Patterns {
    private list: Reactive<Pattern[]> = reactive([]);

    private rule: Reactive<IRule>;

    constructor(rule: Reactive<IRule>) {
        this.rule = rule;

        watch(
            () => rule.patterns,
            (newPatterns) => this.refresh(newPatterns),
            { immediate: true, flush: 'sync' },
        );
        watch(this.list, () => (this.rule.patterns = this.toString()));

        return reactive(this) as unknown as Patterns;
    }

    [Symbol.iterator]() {
        return this.list[Symbol.iterator]() as Iterator<Pattern>;
    }

    get length(): number {
        return this.list.length;
    }

    removeAt(index: number): Pattern | undefined {
        if (index < 0 || index >= this.list.length) return undefined;
        return this.list.splice(index, 1)[0] as Pattern;
    }

    join(separator: string = ', '): string {
        return this.list.map((p) => p.pattern).join(separator);
    }

    toString(): string {
        return this.join();
    }

    toRegex(): RegExp {
        const regexes = this.list.map((p) => p.toRegex());
        const combined = regexes.map((r) => r.source).join('|');
        return new RegExp(combined, 'i');
    }

    matchUrl(urlStr: string): boolean {
        return this.list.some((p) => p.matchUrl(urlStr, this.rule.autoFixPatterns));
    }

    static extractName(rule: IRule): string {
        const patternList = new Patterns(rule);
        return patternList.list.shift()?.pattern || '';
    }

    push(...items: (string | Pattern)[]): number {
        const patterns = items.map((p) => (typeof p === 'string' ? new Pattern(p) : p));
        return this.list.push(...patterns);
    }

    addDefault(): number {
        const defaultPattern = new Pattern('<all_urls>');
        return this.list.push(defaultPattern);
    }

    addExample(): number {
        const examplePattern = new Pattern('https://example.com/*');
        return this.list.push(examplePattern);
    }

    isValid(): boolean {
        return this.list.every((p) => p.isValid);
    }

    refresh(patterns: string | string[]): void {
        if (typeof patterns === 'string')
            patterns = patterns
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter(Boolean);

        this.list.splice(0, this.list.length, ...patterns.map((p) => new Pattern(p)));
    }
}
