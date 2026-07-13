import { format } from 'prettier';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';
import type { CompilerResult } from './utils';

export interface TSCompilerOptions {
    format?: boolean;
}

export async function compileTS(
    source: string,
    options: TSCompilerOptions = { format: false },
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
    if (output?.length && options.format) output = await format(output);

    return {
        output,
        errors: [],
    };
}
