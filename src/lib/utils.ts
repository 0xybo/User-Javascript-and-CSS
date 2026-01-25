import { PlainObject } from '../types/json';

export const IS_DEV = import.meta.env.DEV;

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

export function isPlainObject(value: unknown): value is PlainObject {
    if (value === null || typeof value !== 'object') return false;
    if (Array.isArray(value)) return false;

    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

export function isObject(value: unknown): value is object {
    return typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge<TTarget extends object, TSource extends object>(
    target: TTarget,
    source: TSource,
): TTarget & TSource;
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

const NOT_CHANGED = Symbol('not changed');
export function diff(a: object, b: object) {
    if (a === b) return NOT_CHANGED;

    // If either is not an object, return b (replacement)
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return ['updated', a, b];
    }

    const result: { [K: string]: unknown } = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

    for (const key of keys) {
        const valueA = a[key as keyof typeof a];
        const valueB = b[key as keyof typeof b];

        if (valueA === undefined) {
            result[key] = ['added', valueB];
            continue;
        }

        if (valueB === undefined) {
            result[key] = ['removed', valueA];
            continue;
        }

        const sub = diff(valueA, valueB);
        if (sub !== NOT_CHANGED) {
            result[key] = sub;
        }
    }

    return Object.keys(result).length > 0 ? result : NOT_CHANGED;
}

export function clone<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
