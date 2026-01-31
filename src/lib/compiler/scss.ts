import sass from 'sass';
import type { CompilerError } from 'vue/compiler-sfc';

export async function compileSCSS(source: string): CompilerError {
    const result = await sass.compileStringAsync(source);
}
