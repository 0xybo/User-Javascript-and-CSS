/// <reference types="../../types/sass.js.d.ts" />

import { browser } from '#imports';
import type Sass from 'sass.js/dist/sass.js';
import type { SassCompileError, SassCompileResult, SassCompileSuccess } from 'sass.js/dist/sass.js';
import type { CompilerResult } from './utils';

/**
 * Output formatting styles for compiled CSS.
 */
enum SassStyleEnum {
    nested = 0,
    expanded = 1,
    compact = 2,
    compressed = 3,
}

/**
 * Options for SCSS compilation.
 */
export interface SCSSCompilerOptions {
    /** The output style for the compiled CSS. */
    outputStyle?: 'expanded' | 'compressed';
    /** Whether to generate a source map. */
    sourceMap?: boolean;
    /** Whether to add !important to all CSS properties. */
    important?: boolean;
}

/** The Sass module instance. */
let sass: Sass | null = null;

declare module 'wxt/browser' {
    export interface WxtRuntime {
        getURL(path: 'sass.worker.js'): string;
    }
}

async function resolveSassModule(): Promise<Sass> {
    if (!sass) {
        /* @ts-ignore */
        const { default: SassModule } = await import('sass.js/dist/sass.js');
        const url = browser.runtime.getURL('sass.worker.js');
        sass = new SassModule(url);
    }
    return sass!;
}

/**
 * Compiles SCSS code into CSS.
 *
 * @param source The SCSS source code to compile.
 * @param options Compilation options.
 * @returns A promise that resolves to the compilation result, including the output CSS and any errors.
 */
export async function compileSCSS(
    source: string,
    options: SCSSCompilerOptions = {},
): Promise<CompilerResult> {
    if (!source || !source.trim()) return { output: '', errors: [] };

    const sass = await resolveSassModule();

    if (!sass)
        return { output: '', errors: ['SCSS compilation is not available in development mode.'] };

    try {
        const result: SassCompileResult = await new Promise((resolve) =>
            sass.compile(
                source,
                {
                    style:
                        options.outputStyle === 'compressed'
                            ? SassStyleEnum.compressed
                            : SassStyleEnum.expanded,
                    sourceMapFile: options.sourceMap ? 'output.css.map' : undefined,
                },
                resolve,
            ),
        );

        if ('status' in result && result.status !== 0)
            return {
                output: '',
                errors: [(result as SassCompileError).message || 'Unknown SCSS compilation error.'],
            };

        let output = (result as SassCompileSuccess).text;

        if (options.important) {
            output = output.replace(/;\s*([^;{}]*);/g, (_match, prop: string) => {
                return `;${prop} !important;`;
            });
            output = output.replace(/;\s*([^;{}]*)\}/g, (_match, prop: string) => {
                return `;${prop} !important;}`;
            });
        }

        return { output, errors: [] };
    } catch (err: any) {
        return { output: '', errors: [err.message || String(err)] };
    }
}
