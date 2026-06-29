import sass from 'sass';
import type { CompilerResult } from './utils';

export async function compileSCSS(source: string): Promise<CompilerResult> {
    const result = await sass.compileStringAsync(source, {
        style: 'expanded',
        sourceMap: false,
    });
    return {
        output: result.css,
        errors: [],
    };
}
