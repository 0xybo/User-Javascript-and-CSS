/**
 * Little helper to ensure that a list of elements only contains truthy values
 *
 * @param list the list to filter
 * @returns the filtered list
 */
export function filterNull<T>(list: (T | null)[]): T[] {
    return list.filter(Boolean) as T[];
}

/**
 * Little helper to ensure that a list of elements only contains unique values
 *
 * @param list the list to filter
 * @returns the filtered list
 */
export function unique<T>(list: T[]): T[] {
    return Array.from(new Set(list));
}
