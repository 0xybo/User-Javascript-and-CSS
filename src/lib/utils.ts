import { PlainObject } from '../types/json';

/**
 * Constructor type for creating instances of a class. It represents a class that can be instantiated with any number of arguments and returns an instance of type T.
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * A constant indicating whether the application is running in development mode.
 */
export const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * A constant indicating whether the application is running in production mode.
 */
export const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Picks the specified keys from an object and returns a new object with only those keys.
 *
 * @param obj The object to pick keys from.
 * @param keys The keys to pick.
 * @returns A new object with only the specified keys.
 */
export function pick<TObject extends object, TKey extends keyof TObject>(
    obj: TObject,
    keys: TKey[],
): Pick<TObject, TKey> {
    const result = {} as Pick<TObject, TKey>;
    for (const key of keys) {
        if (key in obj) result[key] = obj[key];
    }
    return result;
}

/**
 * Omits the specified keys from an object and returns a new object without those keys.
 *
 * @param obj The object to omit keys from.
 * @param keys The keys to omit.
 * @returns A new object without the specified keys.
 */
export function omit<TObject extends object, TKey extends keyof TObject>(
    obj: TObject,
    keys: TKey[],
): Omit<TObject, TKey> {
    const result = { ...obj } as Omit<TObject, TKey>;
    for (const key of keys) {
        delete (result as TObject)[key];
    }
    return result;
}

/**
 * Checks if the given value is a plain object (i.e., an object created by the Object constructor or with a null prototype).
 *
 * @param value The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
export function isPlainObject(value: unknown): value is PlainObject {
    if (value === null || typeof value !== 'object') return false;
    if (Array.isArray(value)) return false;

    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

/**
 * Checks if the given value is an object (i.e., not null and of type 'object').
 *
 * @param value The value to check.
 * @returns True if the value is an object, false otherwise.
 */
export function isObject(value: unknown): value is object {
    return typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deeply merges two objects or arrays, modifying the target object/array in place.
 * If the source is not an object or array, it replaces the target with the source.
 *
 * @param target The target object or array to merge into.
 * @param source The source object or array to merge from.
 * @returns The merged target object or array.
 */
export function deepMerge<TTarget extends object, TSource extends object>(
    target: TTarget,
    source: TSource,
): TTarget & TSource;
/**
 * Deeply merges two arrays, modifying the target array in place.
 * If the source is not an array, it replaces the target with the source.
 *
 * @param target The target array to merge into.
 * @param source The source array to merge from.
 * @returns The merged target array.
 */
export function deepMerge<TTarget extends unknown[], TSource extends unknown[]>(
    target: TTarget,
    source: TSource,
): TTarget & TSource;
export function deepMerge<TTarget, TSource>(target: TTarget, source: TSource): TTarget & TSource {
    if (isObject(source)) {
        if (!isObject(target)) return source as TTarget & TSource;
        else {
            for (const prop in source) {
                Object.assign(target, {
                    [prop]: deepMerge((target as TSource)[prop] as object, source[prop] as object),
                });
            }
        }
    } else if (Array.isArray(source)) {
        if (!Array.isArray(target)) return source as TTarget & TSource;
        else {
            for (let index = 0; index < source.length; index++) {
                if (index > target.length) {
                    target.push(...source.slice(index));
                    break;
                }

                if (
                    (isObject(source[index]) && isObject(target[index])) ||
                    (Array.isArray(source[index]) && Array.isArray(target[index]))
                )
                    deepMerge(target[index], source[index]);
                else target.splice(index, 1, source[index]);
            }
            if (target.length > source.length) target.splice(source.length);
        }
    }
    return source as TTarget & TSource;
}

/**
 * Performs a deep equality check between two values, returning true if they are equal and false otherwise.
 * This function handles comparisons for primitive types, arrays, and plain objects.
 */
export function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
    }
    if (isPlainObject(a) && isPlainObject(b)) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;
        return aKeys.every(
            (k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]),
        );
    }
    return false;
}

const UPDATED = Symbol('diff_updated');
const ADDED = Symbol('diff_added');
const REMOVED = Symbol('diff_removed');
const UNCHANGED = Symbol('diff_not_changed');

interface DiffFunction {
    (a: object, b: object): object | typeof UNCHANGED;
    /** A special symbol indicating that a property has been added to the second object. */
    ADDED: typeof ADDED;
    /** A special symbol indicating that a property has been removed from the second object. */
    REMOVED: typeof REMOVED;
    /** A special symbol indicating that a property has been updated in the second object. */
    UPDATED: typeof UPDATED;
    /** A special symbol indicating that there are no changes between two compared objects. */
    NOT_CHANGED: typeof UNCHANGED;
}

/**
 * Computes the difference between two objects, returning a new object that represents the changes.
 * Types of changes:
 * - Added: A property that exists in `b` but not in `a` ({@link DiffFunction.ADDED}).
 * - Removed: A property that exists in `a` but not in `b` ({@link DiffFunction.REMOVED}).
 * - Updated: A property that exists in both `a` and `b` but has different values ({@link DiffFunction.UPDATED}).
 * - Not Changed: A property that exists in both `a` and `b` and has the same value ({@link DiffFunction.NOT_CHANGED}).
 *
 * @param a The first object to compare.
 * @param b The second object to compare.
 * @returns An object representing the differences, or a special symbol if there are no changes.
 */
export const diff: DiffFunction = function (a: object, b: object) {
    a = JSON.parse(JSON.stringify(a));
    b = JSON.parse(JSON.stringify(b));
    const result: Record<string, any> = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

    for (const key of keys) {
        const hasA = Object.prototype.hasOwnProperty.call(a, key);
        const hasB = Object.prototype.hasOwnProperty.call(b, key);
        const aVal = (a as any)[key];
        const bVal = (b as any)[key];

        if (!hasA && hasB) {
            result[key] = { type: ADDED, value: bVal };
        } else if (hasA && !hasB) {
            result[key] = { type: REMOVED, value: aVal };
        } else if (isPlainObject(aVal) && isPlainObject(bVal)) {
            const nested = diff(aVal, bVal);
            if (nested !== UNCHANGED) {
                result[key] = { type: UPDATED, value: nested };
            }
        } else if (!deepEqual(aVal, bVal)) {
            result[key] = { type: UPDATED, oldValue: aVal, newValue: bVal };
        }
        // else: identical, omit
    }

    return Object.keys(result).length === 0 ? UNCHANGED : result;
};

diff.NOT_CHANGED = UNCHANGED;
diff.ADDED = ADDED;
diff.REMOVED = REMOVED;
diff.UPDATED = UPDATED;

/**
 * Prints a human-readable representation of the differences between two objects, as computed by the {@link diff} function.
 * If there are no changes, it returns a message indicating that.
 *
 * @param diffResult The difference object returned by the {@link diff} function.
 * @returns A string representation of the differences.
 */
export function printDiff(diffResult: object | typeof UNCHANGED): any[] {
    if (diffResult === UNCHANGED) {
        return ['No changes detected.'];
    }

    const lines: string[] = [];
    const substitutions: any[] = [];

    function formatValue(value: unknown): any {
        if (typeof value === 'string') return `"${value}"`;
        if (value === undefined) return 'undefined';
        if (typeof value === 'object') return value;
        return String(value);
    }

    function walk(obj: Record<string, any>, prefix: string) {
        for (const key of Object.keys(obj)) {
            const entry = obj[key];
            const path = prefix ? `${prefix}.${key}` : key;

            switch (entry.type) {
                case ADDED:
                    lines.push(`%c+%c ${path}: %o`);
                    substitutions.push(
                        'color: green; font-weight: bold;',
                        'color: inherit; font-weight: normal;',
                        formatValue(entry.value),
                    );
                    break;
                case REMOVED:
                    lines.push(`%c-%c ${path}: %o`);
                    substitutions.push(
                        'color: red; font-weight: bold;',
                        'color: inherit; font-weight: normal;',
                        formatValue(entry.value),
                    );
                    break;
                case UPDATED:
                    if (
                        entry.oldValue === undefined &&
                        entry.newValue === undefined &&
                        isPlainObject(entry.value)
                    ) {
                        // nested diff object
                        walk(entry.value, path);
                    } else {
                        lines.push(`%c~%c ${path}: %o -> %o`);
                        substitutions.push(
                            'color: orange; font-weight: bold;',
                            'color: inherit; font-weight: normal;',
                            formatValue(entry.oldValue),
                            formatValue(entry.newValue),
                        );
                    }
                    break;
            }
        }
    }

    walk(diffResult as Record<string, any>, '');

    return lines.length > 0 ? [lines.join('\n'), ...substitutions] : ['No changes detected.'];
}

/**
 * Creates a deep clone of the given object by serializing it to JSON and then parsing it back.
 * Note: This method does not preserve functions, symbols, or non-serializable properties.
 *
 * @param obj The object to clone.
 * @returns A deep clone of the object.
 */
export function clone<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Checks if the given value is a valid key of the specified enum object.
 *
 * @param enumObj The enum object to check against.
 * @param value The value to check.
 * @returns True if the value is a valid key of the enum, false otherwise.
 */
export function has(enumObj: object, value: string | number): boolean {
    return Object.values(enumObj).includes(value);
}

/**
 * Checks if the given script content is empty or only contains the "use strict" directive.
 *
 * @param script The script content to check.
 * @returns True if the script is empty or only contains "use strict", false otherwise.
 */
export function isEmptyCompiledScript(script: string): boolean {
    const trimmed = script.trim();
    return !trimmed || trimmed == `"use strict";`;
}

/**
 * Formats a byte count into a human-readable string using binary units (B, KB, MB, GB).
 *
 * @param bytes The number of bytes to format.
 * @param decimals The number of decimals to keep for units above bytes (default: 1).
 * @returns The formatted size, e.g. "512 B", "12.3 KB" or "1.5 MB".
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** i;
    return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}

export enum BrowserName {
    CHROME = 'chrome',
    FIREFOX = 'firefox',
    EDGE = 'edge',
    OPERA = 'opera',
    SAFARI = 'safari',
    UNKNOWN = 'unknown',
}

export enum BrowserType {
    CHROMIUM = 'chromium',
    GECKO = 'gecko',
    WEBKIT = 'webkit',
    UNKNOWN = 'unknown',
}

/**
 * Detects the browser type based on the `import.meta.env.BROWSER` environment variable.
 *
 * @returns The detected browser type as a value of the {@link BrowserType} enum.
 */
export function getBrowserType() {
    const target = import.meta.env.BROWSER;

    switch (target) {
        case 'chrome':
            return BrowserType.CHROMIUM;
        case 'firefox':
            return BrowserType.GECKO;
        default:
            return BrowserType.UNKNOWN;
    }
}
