import type { CompilerResult } from './utils';

import type Sass from '@/lib/compiler/sass.js.d.ts';
import type {
    SassCompileError,
    SassCompileResult,
    SassCompileSuccess,
} from '@/lib/compiler/sass.js.d.ts';
import { SassStyleEnum } from '@/lib/compiler/sass.js.ts';

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

let sass: Sass | null = null;

/* @ts-ignore */
const resolveSassModule = async () => (sass ??= (await import('sass.js/dist/sass.js')) as Sass);

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
