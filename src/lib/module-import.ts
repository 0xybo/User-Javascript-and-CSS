import { FileType } from '@/lib/storage/types';

/**
 * The base URL used to resolve a bare module name (e.g. `jquery` or `jquery@3.7.1`) to a file
 * served from the jsDelivr CDN. Appending any path after the package name serves that file.
 */
const NPM_CDN_URL = 'https://cdn.jsdelivr.net/npm/';

/** Matches the last path segment of a URL that looks like a real file name (has an extension). */
const FILE_NAME_PATTERN = /\.[a-z0-9]+$/i;

/** The modes a user can import from. */
export type ImportMode = 'auto' | 'package' | 'url';

/**
 * Returns whether the given source looks like a URL rather than an npm module name.
 *
 * @param source The import source to test.
 * @returns True when the source starts with a scheme or a protocol-relative slash.
 */
export function isUrlLike(source: string): boolean {
    const trimmed = source.trim();
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) || trimmed.startsWith('//');
}

/**
 * Returns the file name (last path segment) of a URL, falling back to the given fallback when the
 * URL has no meaningful basename.
 *
 * @param url The URL to extract the file name from.
 * @param fallback The name to return when no basename can be extracted.
 * @returns The file basename or the fallback.
 */
export function fileNameFromUrl(url: string, fallback: string): string {
    try {
        const path = new URL(url).pathname;
        const base = path.split('/').filter(Boolean).pop();
        return base ? decodeURIComponent(base) : fallback;
    } catch {
        return fallback;
    }
}

/**
 * Extracts the bare package name (version and path stripped) from an npm module source, e.g.
 * `jquery@3.7.1` → `jquery` or `@babel/standalone` → `@babel/standalone`.
 *
 * @param source The npm module source.
 * @returns The bare package name, or null when the source is not an npm module.
 */
export function npmPackageName(source: string): string | null {
    const trimmed = source.trim();
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) || trimmed.startsWith('//')) return null;

    if (trimmed.startsWith('@')) {
        const match = trimmed.match(/^(@[^/]+\/[^@/]+)(?:@[^/]+)?(?:\/.*)?$/);
        return match ? match[1] : null;
    }
    const match = trimmed.match(/^([^@/]+)(?:@[^/]+)?(?:\/.*)?$/);
    return match ? match[1] : null;
}

/**
 * Resolves a user-provided import source to an absolute, fetchable URL. A source that already
 * looks like a URL is used as-is; anything else is treated as an npm module name (optionally with
 * a version and/or a file path) and resolved against the jsDelivr CDN.
 *
 * In `package` mode the source is always treated as an npm module name; in `url` mode it is
 * always treated as a URL. `auto` (the default) detects which one it is.
 *
 * @param source The URL or npm module name to import.
 * @param mode How to interpret the source.
 * @returns The resolved absolute URL to fetch.
 * @throws If the source is empty, or when the mode requires a URL but the source is not one.
 *
 * @example
 * resolveSource('https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js')
 * resolveSource('jquery@3.7.1')
 * resolveSource('@babel/standalone')
 * resolveSource('jquery', 'package')
 * resolveSource('https://example.com/x.js', 'url')
 */
export function resolveSource(source: string, mode: ImportMode = 'auto'): string {
    const trimmed = source.trim();
    if (!trimmed) throw new Error('Empty source');

    if (mode === 'url') {
        if (!isUrlLike(trimmed)) throw new Error('Not a URL');
        return trimmed;
    }

    if (mode === 'package' || !isUrlLike(trimmed)) return NPM_CDN_URL + trimmed;
    return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
}

/**
 * Computes a display name for an imported file from its final URL and source. A real file
 * basename (with an extension) is preferred; when the request pointed at a package root (no file
 * name in the URL), the package name is used with an extension derived from the detected type.
 *
 * @param finalUrl The final URL of the resource after redirects.
 * @param source The original import source.
 * @param type The detected file type.
 * @returns A display name for the imported file.
 */
export function importFileName(finalUrl: string, source: string, type: FileType): string {
    const base = fileNameFromUrl(finalUrl, '');
    // A package reference (e.g. `jquery@3.7.1`) can end in a dot-digit sequence that looks like
    // an extension, so treat basenames containing `@` as package refs, not file names.
    if (base && !base.includes('@') && FILE_NAME_PATTERN.test(base)) return base;

    const pkg = npmPackageName(source);
    if (pkg) return pkg + (type === FileType.Css ? '.css' : '.js');

    return type === FileType.Css ? 'style.css' : 'script.js';
}

/**
 * Detects the {@link FileType} of an imported file based on its URL path and, when available, the
 * content type reported by the server. The URL extension takes precedence over the content type so
 * that e.g. a `text/css` response for a `.js` file is still treated as JavaScript.
 *
 * @param url The (final) URL of the resource.
 * @param contentType An optional HTTP content type of the resource.
 * @returns The detected file type (JavaScript or CSS).
 */
export function detectFileType(url: string, contentType?: string): FileType {
    let path = '';
    try {
        path = new URL(url).pathname.toLowerCase();
    } catch {
        path = url.toLowerCase();
    }

    if (path.endsWith('.css')) return FileType.Css;
    if (path.endsWith('.scss') || path.endsWith('.sass')) return FileType.Css;
    if (/(\.m?[jt]s|\.cjs)$/.test(path)) return FileType.Javascript;
    if (contentType?.toLowerCase().includes('text/css')) return FileType.Css;
    return FileType.Javascript;
}

/**
 * Suggests a module name from an import source, e.g. `jquery@3.7.1` → `jquery`, a URL pointing at
 * `.../jquery.min.js` → `jquery.min`, and a bare host (`https://example.com/`) → `example.com`.
 *
 * @param source The URL or npm module name.
 * @param mode How the source is interpreted; defaults to `auto`.
 * @returns A display name for the module, falling back to `'module'`.
 */
export function suggestModuleName(source: string, mode: ImportMode = 'auto'): string {
    const trimmed = source.trim();
    if (!trimmed) return 'module';

    const usePackage = mode === 'package' || (mode === 'auto' && !isUrlLike(trimmed));
    if (usePackage) return npmPackageName(trimmed) ?? 'module';

    try {
        const url = new URL(trimmed);
        const base = fileNameFromUrl(trimmed, '');
        if (base && base !== url.hostname) {
            const noExt = base.replace(FILE_NAME_PATTERN, '');
            if (noExt) return noExt;
        }
        return url.hostname || 'module';
    } catch {
        return trimmed;
    }
}

/**
 * Fetches a resource over the network and returns its text content, the final URL (after any
 * redirects) and the reported content type.
 *
 * @param url The URL to fetch.
 * @returns The fetched file data.
 * @throws If the network request fails or the server responds with a non-OK status.
 */
export async function fetchFile(url: string): Promise<FetchedFile> {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return {
        text: await response.text(),
        url: response.url || url,
        contentType: response.headers.get('content-type') ?? undefined,
    };
}

/**
 * The result of fetching a file over the network.
 */
export interface FetchedFile {
    /** The text content of the fetched file. */
    text: string;
    /** The final URL of the resource after redirects. */
    url: string;
    /** The content type reported by the server, if any. */
    contentType?: string;
}