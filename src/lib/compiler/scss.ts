import { compileStringAsync } from 'sass';
import type { CompilerResult } from './utils';

export async function compileSCSS(source: string): Promise<CompilerResult> {
    const result = await compileStringAsync(source, {
        style: 'expanded',
        sourceMap: false,
    });
    return {
        output: result.css,
        errors: [],
    };
}
