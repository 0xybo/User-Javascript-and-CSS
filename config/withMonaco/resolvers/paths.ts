import path from 'node:path';
import { resolveModule } from './module';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Resolves an file path either against the monaco-editor esm package, or by itself.
 *
 * @param file the filepath to resolve
 * @returns the resolved path
 */
export function resolveMonacoPath(file: string): string {
    if (IS_PRODUCTION) {
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
    } else {
        try {
            return resolveModule(path.join(process.cwd(), 'dist', 'monaco-editor', file));
        } catch {
            /* empty */
        }
    }

    return resolveModule(file);
}
