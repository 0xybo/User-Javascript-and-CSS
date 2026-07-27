// Type definitions for sass.js
// Based on sass.js v0.11.1 (libsass 3.6.2, via emscripten)
// Project: https://github.com/medialize/sass.js
// Written by: Claude AI

export * from './sass.js';

/**
 * A generated JavaScript SourceMap (v3) as produced by libsass.
 */
export interface SassSourceMap {
    version: number;
    sourceRoot: string;
    file: string;
    sources: string[];
    sourcesContent?: string[];
    mappings: string;
    names: string[];
}

/**
 * Options accepted by Sass.prototype.options() / passed per-compile call.
 * All properties are optional; provided options are merged onto
 * previously set options.
 */
export interface SassOptions {
    /** Output format: nested, expanded, compact, compressed */
    style?: SassStyleEnum;
    /**
     * Decimal point precision for outputting fractional numbers.
     * -1 uses the libsass default (currently 5).
     */
    precision?: number;
    /** Whether to include inline source comments */
    comments?: boolean;
    /** String used for indentation */
    indent?: string;
    /** String used for line feeds */
    linefeed?: string;
    /** Treat source_string as SASS (indented syntax) as opposed to SCSS */
    indentedSyntax?: boolean;
    /** Path to source map file; enables source map generation */
    sourceMapFile?: string;
    /** Pass-through as sourceRoot property in the generated source map */
    sourceMapRoot?: string;
    /**
     * The input path used for source map generation.
     * Defaults to "stdin" for data contexts, or the input file for file contexts.
     */
    inputPath?: string;
    /**
     * The output path used for source map generation.
     * Libsass does not write to this file; it's only used for map info.
     */
    outputPath?: string;
    /** Embed included file contents in the source map */
    sourceMapContents?: boolean;
    /** Embed the sourceMappingUrl as a data URI */
    sourceMapEmbed?: boolean;
    /** Disable sourceMappingUrl in the CSS output */
    sourceMapOmitUrl?: boolean;
    /**
     * Arbitrary JSON-serializable data passed through to the Importer
     * Callback, accessible on `request.options`.
     */
    importer?: unknown;
    /** Reset options back to Sass.js defaults */
    defaults?: unknown;
}

/**
 * Successful compilation result.
 */
export interface SassCompileSuccess {
    /** 0 indicates success */
    status: 0;
    /** The compiled CSS */
    text: string;
    /** The generated SourceMap, if source maps were enabled */
    map?: SassSourceMap | null;
    /** Paths of files used during compilation */
    files: string[];
}

/**
 * Failed compilation result.
 */
export interface SassCompileError {
    /** Non-zero indicates an error occurred */
    status: number;
    /** The file the problem occurred in */
    file: string;
    /** The line the problem occurred on */
    line: number;
    /** The character on the line the problem started with */
    column: number;
    /** The problem description */
    message: string;
    /** Human readable formatting of the error */
    formatted: string;
}

export type SassCompileResult = SassCompileSuccess | SassCompileError;

export function isSassCompileError(result: SassCompileResult): result is SassCompileError;

/**
 * Request object passed to the Importer Callback.
 */
export interface SassImporterRequest {
    /** Path libsass wants to load, i.e. content of `@import "<path>";` */
    current: string;
    /** Absolute path of the previously imported file ("stdin" if first) */
    previous: string;
    /** `current` path resolved against `previous` path */
    resolved: string;
    /** Absolute path in the file system, null if not found */
    path: string | null;
    /** The value of options.importer, passed through */
    options?: unknown;
}

/**
 * Result object passed to the Importer Callback's `done()` function.
 * All properties are optional / mutually exclusive use cases.
 */
export interface SassImporterResult {
    /** Absolute path to load from the file system */
    path?: string;
    /** Content to use instead of loading a file */
    content?: string;
    /** Error message to print and abort the compilation */
    error?: string;
}

export type SassImporterDone = (result?: SassImporterResult) => void;

export type SassImporterCallback = (request: SassImporterRequest, done: SassImporterDone) => void;

/** Generic "operation completed" callback with no arguments. */
export type SassVoidCallback = () => void;

/** Map of file path -> content, used for batch writeFile/readFile calls. */
export interface SassFileMap {
    [path: string]: string;
}

/** Map of file path -> boolean success flag, e.g. batch writeFile/removeFile results. */
export interface SassBooleanResultMap {
    [path: string]: boolean;
}

/** Map of file path -> file content (or undefined on read failure). */
export interface SassReadResultMap {
    [path: string]: string | undefined;
}

export class Sass {
    constructor(workerUrl?: string);

    /** Output style constants: nested, expanded, compact, compressed */
    static style: SassStyleEnum;
    /** Comment mode constants: none, default */
    static comments: SassCommentsEnum;

    /** Instance accessor mirroring Sass.style */
    style: SassStyleEnum;
    /** Instance accessor mirroring Sass.comments */
    comments: SassCommentsEnum;

    /**
     * Globally set the URL where sass.worker.js is located, so it does not
     * have to be supplied to every constructor.
     */
    static setWorkerUrl(workerUrl: string): void;

    /**
     * Resolve the possible path variations libsass would try for a given
     * `@import` path (synchronous API only, see sass.sync.js).
     */
    static getPathVariations?(path: string): string[];

    /**
     * Find the first path variation that exists on disk, using the provided
     * stat function (synchronous API / Node only).
     */
    static findPathVariation?(
        statSync: (path: string) => unknown,
        path: string,
    ): string | undefined;

    /** Terminate the underlying Worker and clean up the instance. */
    destroy(): void;

    /**
     * Register (or unregister) an Importer Callback to intercept `@import`
     * resolution during compilation.
     */
    importer(importerCallback: SassImporterCallback | null, callback?: SassVoidCallback): void;

    // ---- Compilation ----

    /** Compile a SCSS/SASS source string to CSS. */
    compile(source: string, callback: (result: SassCompileResult) => void): void;
    compile(
        source: string,
        options: SassOptions,
        callback: (result: SassCompileResult) => void,
    ): void;

    /** Compile a file already present in emscripten's file system to CSS. */
    compileFile(path: string, callback: (result: SassCompileResult) => void): void;
    compileFile(
        path: string,
        options: SassOptions,
        callback: (result: SassCompileResult) => void,
    ): void;

    // ---- Options ----

    /** Reset options to Sass.js defaults. */
    options(reset: 'defaults', callback?: SassVoidCallback): void;
    /** Merge the given options onto previously set options. */
    options(options: SassOptions, callback?: SassVoidCallback): void;

    // ---- File system: writing ----

    /** Register a single file to be available for @import. */
    writeFile(path: string, source: string, callback?: (success: boolean) => void): void;
    /** Register multiple files at once. */
    writeFile(files: SassFileMap, callback?: (result: SassBooleanResultMap) => void): void;

    // ---- File system: reading ----

    /** Read a single file's content. */
    readFile(path: string, callback: (content: string | undefined) => void): void;
    /** Read multiple files' content. */
    readFile(paths: string[], callback: (result: SassReadResultMap) => void): void;

    // ---- File system: removing ----

    /** Remove a single file. */
    removeFile(path: string, callback?: (success: boolean) => void): void;
    /** Remove multiple files. */
    removeFile(paths: string[], callback?: (result: SassBooleanResultMap) => void): void;

    /** Remove all files from the file system. */
    clearFiles(callback?: SassVoidCallback): void;

    /** List the paths of all currently registered files. */
    listFiles(callback: (list: string[]) => void): void;

    // ---- File system: (pre/lazy)loading ----

    /**
     * Download all registered files immediately (asynchronously).
     * HTTP requests are made relative to the worker.
     */
    preloadFiles(
        base: string,
        directory: string,
        files: string[],
        callback?: SassVoidCallback,
    ): void;

    /**
     * @deprecated Register files to be (synchronously) loaded when required
     * by libsass. Only available in the Worker API, not the synchronous API.
     */
    lazyFiles(base: string, directory: string, files: string[], callback?: SassVoidCallback): void;
}

declare module 'sass.js/dist/sass.js' {
    export = Sass;
}

export default Sass;
