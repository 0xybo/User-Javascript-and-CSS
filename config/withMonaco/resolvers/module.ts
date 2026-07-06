/**
 * Resolves an module path by utilising `import.meta.resolve`, but making sure we're returning
 * the string path instead of an URL'ish thing.
 *
 * @param file the filepath to resolve
 * @return the resolved path
 */
export function resolveModule(file: string): string {
    const url = import.meta.resolve(file).toString();
    return decodeURI(url.replace(/^file:\/\//, ''));
}
