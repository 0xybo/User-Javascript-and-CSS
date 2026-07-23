import path from 'node:path';
import { resolveModule } from './module';

/**
 * Resolves an file path either against the monaco-editor esm package, or by itself.
 *
 * @param file the filepath to resolve
 * @returns the resolved path
 */
export function resolveMonacoPath(file: string, outputDir?: string): string {
    try {
        return resolveModule(path.join('monaco-editor/esm', file));
    } catch {
        /* empty */
    }

    try {
        return resolveModule(path.join(process.cwd(), 'node_modules/monaco-editor/esm', file));
    } catch {
        /* empty */
    }

    return resolveModule(file);
}
