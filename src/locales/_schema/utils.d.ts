/**
 * Constructs a type (based on a string) with named arguments.
 *
 * @template NamedArgs - List of named argument names
 *
 * @example
 * type Test = WithNamedArgs<['value', 'count']>
 * // Test = `${string}{value}${string}{count}${string}`
 *
 * // ====== WORKS ======
 * // Named arguments
 * const t: Test = 'Hello {value}, you have {count} new messages';
 * // Pluralization
 * const t: Test = 'Hello {value}, you don\'t have new messages | Hello {value}, you have {count} new message';
 * // With an extra argument
 * const t: Test = 'Hello {value}, you have {count} new messages {extra}';
 *
 * // ====== DOES NOT WORK ======
 * // With a missing argument
 * const t: Test = 'Hello {value}, you don\'t have new messages';
 * // With a misnamed argument
 * const t: Test = 'Hello {value}, you have {extra} new messages';
 * // With a positional argument
 * const t: Test = 'Hello {0}, you have {1} new messages';
 */
type WithNamedArgs<NamedArgs extends string[]> = NamedArgs extends [infer Arg, ...infer Rest]
    ? `${string}{${Arg}}${WithNamedArgs<Rest>}`
    : string;

/**
 * Constructs a type (based on a string) with positional arguments.
 *
 * @template Count - Number of positional arguments
 * @template RecursiveLimitTuple - Recursive tuple to limit recursion, should not be defined
 *
 * @example
 * type Test = WithPositionalArgs<2>
 * // Test = `${string}{0}${string}{1}${string}`
 *
 * // ====== WORKS ======
 * // Positional arguments
 * const t: Test = 'Hello {0}, you have {1} unread messages.';
 * // Pluralization
 * const t: Test = 'Hello {0}, you don\'t have new messages | Hello {0}, you have {1} new message'
 * // With an extra argument
 * const t: Test = 'Hello {0}, you have {1} new messages {2}';
 *
 * // ====== DOES NOT WORK ======
 * // With a missing argument
 * const t: Test = 'Hello {0}, you don\'t have new messages';
 * // With a misnamed argument
 * const t: Test = 'Hello {0}, you have {extra} new messages';
 * // With a named argument
 * const t: Test = 'Hello {value}, you have {count} new messages';
 */
type WithPositionalArgs<
    Count extends number,
    RecursiveLimitTuple = [],
> = Count extends RecursiveLimitTuple['length']
    ? string
    : `${string}{${RecursiveLimitTuple['length']}}${WithPositionalArgs<
          Count,
          [...RecursiveLimitTuple, 0]
      >}`;

/**
 * Constructs a type (based on a string) with pluralization.
 *
 * @template T - Type of the string
 *
 * @example
 * type Test = WithPlural<string>
 * Test = string
 *
 * type Test = WithPlural<WithNamedArgs<['value', 'count']>>
 * Test = `${string}{value}${string}{count}${string}`
 *      | `${string} | ${string}{value}${string}{count}${string}`
 *      | `${string} | ${string} | ${string}{value}${string}{count}${string}`
 */
type WithPlural<T extends string> = `${T}` | `${string} | ${T}` | `${string} | ${string} | ${T}`;
