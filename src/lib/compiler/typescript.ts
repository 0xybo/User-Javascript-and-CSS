import { format } from 'prettier';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';
import type { CompilerResult } from './utils';

export interface TSCompilerOptions {}

export async function compileTS(
    source: string,
    options: TSCompilerOptions,
): Promise<CompilerResult> {
    const result = transpileModule(source, {
        compilerOptions: {
            target: ScriptTarget.ESNext,
            module: ModuleKind.ESNext,
            strict: true,
            sourceMap: false,
        },
    });
    let output = result.outputText;
    if (output?.length) output = await format(source);

    return {
        output: result.outputText,
        errors: [],
    };
}
