/* ========================================================================== *
 *                                JSON Types                                  *
 * ========================================================================== */
// A set of types for JSON objects and arrays

/**
 * Represents a JSON primitive value.
 *
 * Can be a :
 * - string
 * - number
 * - boolean
 * - symbol
 * - bigint
 * - null
 * - undefined
 *
 * @see https://stackoverflow.com/a/59647842
 */
export type JSONPrimitive = string | number | boolean | symbol | bigint | null | undefined;
/**
 * Represents a JSON array value.
 *
 * Can be an array of :
 * - JSON Value : {@linkcode JSONValue}
 * - Readonly JSON Value : {@linkcode JSONValue}
 *
 * @see https://stackoverflow.com/a/59647842
 */
export type JSONArray = JSONValue[] | readonly JSONValue[];
/**
 * Represents a JSON value.
 *
 * Can be a :
 * - JSON primitive : {@linkcode JSONPrimitive}
 * - JSON object : {@linkcode JSONObject}
 * - JSON array : {@linkcode JSONArray}
 *
 * @see https://stackoverflow.com/a/59647842
 */
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
/**
 * Represents a JSON object value.
 *
 * Can be an object of :
 * - JSON Value : {@linkcode JSONValue}
 * - Optional JSON Value : {@linkcode JSONValue}
 *
 * @see https://stackoverflow.com/a/59647842
 */
export type JSONObject = { [key in string]: JSONValue } & {
    [key in string]?: JSONValue | undefined;
};
/**
 * Represents a JSON composite value.
 *
 * Can be a :
 * - JSON object : {@linkcode JSONObject}
 * - JSON array : {@linkcode JSONArray}
 *
 * @see https://stackoverflow.com/a/59647842
 */
export type JSONComposite = JSONObject | JSONArray;
/**
 * Represents a JSON value.
 *
 * Can be a :
 * - JSON primitive : {@linkcode JSONPrimitive}
 * - JSON composite : {@linkcode JSONComposite}
 *
 * @see https://stackoverflow.com/a/59647842
 */
export type JSON = JSONPrimitive | JSONComposite;

/**
 * Checks if a given type is a plain object.
 *
 * A plain object is an object that is created by the object literal notation or the `new Object()` constructor.
 *
 * @see {@linkcode JSONObject}
 *
 * @template T - The type to check.
 * @returns - The original type if it is a plain object, otherwise `never`.
 */
export type IsPlainObject<T> = T extends JSONObject ? T : never;
/**
 * Represents a plain object.
 */
export type PlainObject<T = unknown> = Record<string, T>;
