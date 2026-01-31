import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';
import type { CompilerResult } from './utils';
import { format } from 'prettier';

export interface TSCompilerOptions {
    
}

export async function compileTS(source: string, options: ): Promise<CompilerResult> {
    const result = transpileModule(source, {
        compilerOptions: {
            target: ScriptTarget.ESNext,
            module: ModuleKind.ESNext,
            strict: true,
            sourceMap: false,
        }
    });
    let output = result.outputText;
    if (output?.length) output = format(source)

    return {
        output: result.outputText,
        errors: [],
    };
}
