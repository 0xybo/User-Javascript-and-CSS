import type {
    Localized,
    LocalizedMessages,
    LocalizedMessagesType,
    MessageKeySeparator,
    MessagesType,
} from '@/locales';
import { messageKeySeparator } from '@/locales';
import type Messages from '@/locales/_schema/index.d';
import type { TranslateOptions } from '@intlify/core-base';
import { useI18n } from 'vue-i18n';

/**
 * Extracts the JSON paths of the given type.
 *
 * This type is a copy of the JsonPaths type provided by the \@intlify/core-base package,
 * but it is modified to work with the {@link MessageKeySeparator} type that use underscores
 * instead of dots as separators.
 *
 * @template T - Type
 * @template Key - Key
 *
 * @example
 * MessageKeySeparator = '.'
 * type Test = JsonPaths<{ A: { B: string }, C: number }>
 * // Test = 'A.B' | 'C'
 */
export type JsonPaths<T, Key extends keyof T = keyof T> = Key extends string
    ? T[Key] extends Record<string, any>
        ? `${Key}${MessageKeySeparator}${JsonPaths<T[Key]>}`
        : `${Key}`
    : never;

/**
 * Extracts the paths of the translations.
 *
 * This type is a copy of the TranslationsPaths type provided by the \@intlify/core-base package,
 * but it is modified to work with the {@link JsonPaths} type that use underscores instead of dots
 * as separators.
 *
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = TranslationsPaths<{COMMON: { THEME: string, LANGUAGE: { EN: string, FR: string } } }>
 * // Test = 'COMMON.THEME' | 'COMMON.LANGUAGE' | 'COMMON.LANGUAGE.EN' | 'COMMON.LANGUAGE.FR'
 */
export type TranslationsPaths<T extends object, K extends keyof T = keyof T> = K extends string
    ? JsonPaths<T[K]>
    : never;

/**
 * Extracts the paths of the translations but omit the last key.
 *
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = TranslationsPaths<{COMMON: { THEME: string } }>
 * // Test = 'COMMON.THEME'
 */
export type Prefixes<Paths extends string = TranslationsPaths<LocalizedMessages>> =
    Paths extends `${infer Prefix}${MessageKeySeparator}${infer Rest}`
        ? Prefix | `${Prefix}${MessageKeySeparator}${Prefixes<Rest>}`
        : never;

/**
 * Extracts the paths of the translations but omit the first key.
 *
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = Suffixes<'COMMON.THEME'>
 * // Test = 'THEME'
 */
export type Suffixes<Paths extends string = TranslationsPaths<LocalizedMessages>> =
    Paths extends `${string}${MessageKeySeparator}${infer Rest}` ? Rest | Suffixes<Rest> : never;

/**
 * Returns the suffixes of the paths that start with the given prefix.
 *
 * @template Prefix - Prefix
 * @template Paths - Paths
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = SuffixesOf<'COMMON', 'COMMON.THEME'>
 * // Test = 'THEME'
 */
export type SuffixesOf<
    Prefix extends Prefixes<Paths>,
    Paths extends string = TranslationsPaths<LocalizedMessages>,
> = Paths extends `${Prefix}${MessageKeySeparator}${infer Rest}` ? Rest : never;

/**
 * Returns the type of the value at the given path.
 *
 * @template Path - Path
 * @template Obj - Object
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = PathToType<'COMMON.THEME', { COMMON: { THEME: string } }>
 * // Test = string
 */
export type PathToType<
    Path extends string,
    Obj extends MessagesType,
> = Path extends `${infer Prefix}${MessageKeySeparator}${infer Rest}`
    ? Prefix extends keyof Obj
        ? PathToType<Rest, Obj[Prefix]>
        : never
    : Obj[Path];

/**
 * Returns the full path of the given prefix and suffix.
 *
 * If the path does not exist in Paths, it returns never.
 *
 * @template Prefix - Prefix
 * @template Suffix - Suffix
 * @template Paths - Paths
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = FullPath<'COMMON', 'THEME'>
 * // Test = 'COMMON.THEME'
 */
export type FullPath<
    Prefix extends Prefixes<Paths>,
    Suffix extends Suffixes<Paths>,
    Paths extends string = TranslationsPaths<LocalizedMessages>,
> = `${Prefix}${MessageKeySeparator}${Suffix}` extends Paths
    ? `${Prefix}${MessageKeySeparator}${Suffix}`
    : never;

/**
 * Returns all the paths that start with the given prefix.
 *
 * @template Prefix - Prefix
 * @template Paths - Paths
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = FullPathOf<'COMMON'>
 * // Test = 'COMMON.THEME' | 'COMMON.LANGUAGE' | 'COMMON.LANGUAGE.EN' | 'COMMON.LANGUAGE.FR'
 */
export type FullPathOf<
    Prefix extends Prefixes<Paths>,
    Paths extends string = TranslationsPaths<LocalizedMessages>,
> = Paths extends `${Prefix}${MessageKeySeparator}${infer Rest}`
    ? `${Prefix}${MessageKeySeparator}${Rest}`
    : never;

/**
 * Returns the message type of the given path.
 *
 * @template Path - Path
 * @template Msgs - Messages
 * @template Paths - Paths
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = TranslationsType<'NAMED', { NAMED: 'Hello {name}, you have {count} unread messages.' }>
 * // Test = 'Hello {name}, you have {count} unread messages.'
 */
export type TranslationsType<
    Path extends Paths,
    Msgs extends LocalizedMessagesType = LocalizedMessages,
    Paths extends TranslationsPaths<Msgs> = TranslationsPaths<Msgs>,
> = PathToType<Path, Msgs[string]>;

/**
 * Filters the translation keys with named arguments.
 *
 * @template S - Paths
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = HasNamedArgs<'NAMED' | 'NO_ARGS', { NAMED: 'Hello {name}', NO_ARGS: 'Hello' }>
 * // Test = 'NAMED'
 */
export type HasNamedArgs<S extends string, Msgs extends MessagesType = Messages> = {
    [K in S]: PathToType<K, Msgs> extends `${string}{${number}}${string}`
        ? never
        : PathToType<K, Msgs> extends `${string}{${string}}${string}`
          ? K
          : never;
}[S];

/**
 * Filters the translation keys with positional arguments.
 *
 * @template S - Paths
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = HasPositionalArgs<'POSITIONAL' | 'NO_ARGS', { POSITIONAL: 'Hello {0}', NO_ARGS: 'Hello' }>
 * // Test = 'POSITIONAL'
 */
export type HasPositionalArgs<S extends string, Msgs extends MessagesType = Messages> = {
    [K in S]: PathToType<K, Msgs> extends `${string}{${number}}${string}` ? K : never;
}[S];

/**
 * Filters the translation keys without arguments.
 *
 * @template S - Paths
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = HasNoArgs<'NO_ARGS' | 'NAMED', { NAMED: 'Hello {name}', NO_ARGS: 'Hello' }>
 * // Test = 'NO_ARGS'
 */
export type HasNoArgs<S extends string, Msgs extends MessagesType = Messages> = {
    [K in S]: PathToType<K, Msgs> extends `${string}{${number}}${string}`
        ? never
        : PathToType<K, Msgs> extends `${string}{${string}}${string}`
          ? never
          : K;
}[S];

/**
 * Filters the translation keys with pluralization.
 *
 * @template S - Paths
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = HasPlural<'PLURAL' | 'NO_ARGS', { PLURAL: 'Hello {0}, you don\'t have new messages | Hello {0}, you have {1} new message', NO_ARGS: 'Hello' }>
 * // Test = 'PLURAL'
 */
export type HasPlural<S extends string, Msgs extends MessagesType = Messages> = {
    [K in S]: PathToType<K, Msgs> extends `${string} | ${string}` ? K : never;
}[S];

/**
 * Extracts the named arguments names from a string.
 *
 * @template S - String
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = InferNamedArgsNames<'Hello {name}, you have {count} unread messages.'>
 * // Test = ['name', 'count']
 */
export type InferNamedArgsNames<S extends string> =
    S extends `${string}{${infer Name}}${infer Rest}` ? [Name, ...InferNamedArgsNames<Rest>] : [];

/**
 * Extracts the named arguments names from a path.
 *
 * @template Path - Path
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = InferNamedArgsNamesFromPath<'NAMED', { NAMED: 'Hello {name}, you have {count} unread messages.' }>
 * // Test = ['name', 'count']
 */
export type InferNamedArgsNamesFromPath<
    Path extends string,
    Msgs extends MessagesType = Messages,
> = InferNamedArgsNames<PathToType<Path, Msgs> & string>;

/**
 * Extracts the named arguments from a string.
 *
 * @template S - String
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = InferNamedArgs<'Hello {name}, you have {count} unread messages.'>
 * // Test = { name: unknown, count: unknown }
 */
export type InferNamedArgs<S extends string> = {
    [K in InferNamedArgsNames<S>[number]]: unknown;
};

/**
 * Extracts the named arguments from a path.
 *
 * @template Path - Path
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = InferNamedArgsFromPath<'NAMED', { NAMED: 'Hello {name}, you have {count} unread messages.' }>
 * // Test = { name: unknown, count: unknown }
 */
export type InferNamedArgsFromPath<
    Path extends string,
    Msgs extends MessagesType = Messages,
> = InferNamedArgs<PathToType<Path, Msgs> & string>;

/**
 * Extracts the positional arguments names from a string.
 *
 * @template S - String
 * @template A - Accumulator, to keep track of indexes
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = InferPositionalArgsNames<'Hello {0}, you have {1} unread messages.'>
 * // Test = [0, 1]
 */
export type InferPositionalArgsNames<
    S extends string,
    A extends Array<unknown> = [],
> = S extends `${string}{${number}}${infer Rest}`
    ? [A['length'], ...InferPositionalArgsNames<Rest, [...A, unknown]>]
    : [];

/**
 * Extracts the positional arguments names from a path.
 *
 * @template Path - Path
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = InferPositionalArgsNamesFromPath<'POSITIONAL', { POSITIONAL: 'Hello {0}, you have {1} unread messages.' }>
 * // Test = [0, 1]
 */
export type InferPositionalArgsNamesFromPath<
    Path extends string,
    Msgs extends MessagesType = Messages,
> = InferPositionalArgsNames<PathToType<Path, Msgs> & string>;

/**
 * Extracts the positional arguments from a string.
 *
 * @template S - String
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = InferPositionalArgs<'Hello {0}, you have {1} unread messages.'>
 * // Test = [unknown, unknown]
 */
export type InferPositionalArgs<S extends string> = S extends `${string}{${number}}${infer Rest}`
    ? [unknown, ...InferPositionalArgs<Rest>]
    : [];

/**
 * Extracts the positional arguments from a path.
 *
 * @template Path - Path
 * @template Msgs - Messages
 *
 * @example
 * // MessageKeySeparator = '.'
 * type Test = InferPositionalArgsFromPath<'POSITIONAL', { POSITIONAL: 'Hello {0}, you have {1} unread messages.' }>
 * // Test = [unknown, unknown]
 */
export type InferPositionalArgsFromPath<
    Path extends string,
    Msgs extends MessagesType = Messages,
> = InferPositionalArgs<PathToType<Path, Msgs> & string>;

/**
 * Translation function composer.
 *
 * @template LM - Messages
 * @template Paths - Paths
 */
export interface TranslateComposer<
    M extends MessagesType = Messages,
    LM extends Localized<M> = Localized<M>,
    Paths extends TranslationsPaths<LM> = TranslationsPaths<LM>,
> {
    // No arguments
    <P extends HasNoArgs<Paths>>(path: P): TranslationsType<P, LM>;
    <P extends HasPlural<HasNoArgs<Paths>>>(path: P, plural: number): TranslationsType<P, LM>;
    <P extends HasNoArgs<Paths>>(path: P, defaultTranslation: string): TranslationsType<P, LM>;
    <P extends HasNoArgs<Paths>>(path: P, options: TranslateOptions): TranslationsType<P, LM>;

    // Named arguments
    <P extends HasNamedArgs<Paths>>(
        path: P,
        named: InferNamedArgsFromPath<P, M>,
    ): TranslationsType<P, LM>;
    <P extends HasPlural<HasNamedArgs<Paths>>>(
        path: P,
        named: InferNamedArgsFromPath<P, M>,
        plural: number,
    ): TranslationsType<P, LM>;
    <P extends HasNamedArgs<Paths>>(
        path: P,
        named: InferNamedArgsFromPath<P, M>,
        defaultTranslation: string,
    ): TranslationsType<P, LM>;
    <P extends HasNamedArgs<Paths>>(
        path: P,
        named: InferNamedArgsFromPath<P, M>,
        options: TranslateOptions,
    ): TranslationsType<P, LM>;

    // Positional arguments
    <P extends HasPositionalArgs<Paths>>(
        path: P,
        positional: InferPositionalArgsFromPath<P, M>,
    ): TranslationsType<P, LM>;
    <P extends HasPlural<HasPositionalArgs<Paths>>>(
        path: P,
        positional: InferPositionalArgsFromPath<P, M>,
        plural: number,
    ): TranslationsType<P, LM>;
    <P extends HasPositionalArgs<Paths>>(
        path: P,
        positional: InferPositionalArgsFromPath<P, M>,
        defaultTranslation: string,
    ): TranslationsType<P, LM>;
    <P extends HasPositionalArgs<Paths>>(
        path: P,
        positional: InferPositionalArgsFromPath<P, M>,
        options: TranslateOptions,
    ): TranslationsType<P, LM>;
}

/**
 * Translation function composer.
 *
 * @template P - Prefixes
 */
export interface TranslationComposerPrefixed<
    P extends Prefixes<AP>,
    M extends MessagesType = Messages,
    LM extends Localized<M> = Localized<M>,
    AP extends TranslationsPaths<LM> = TranslationsPaths<LM>,
> {
    // No arguments
    <PA extends HasNoArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
    <PA extends HasNoArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        plural: number,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
    <PA extends HasNoArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        defaultTranslation: string,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
    <PA extends HasNoArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        options: TranslateOptions,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;

    // Named arguments
    <PA extends HasNamedArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        named: Partial<InferNamedArgsFromPath<FullPath<P, S & Suffixes<AP>, AP>, M>>,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
    <PA extends HasNamedArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        named: Partial<InferNamedArgsFromPath<FullPath<P, S & Suffixes<AP>, AP>, M>>,
        plural: number,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
    <PA extends HasNamedArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        named: Partial<InferNamedArgsFromPath<FullPath<P, S & Suffixes<AP>, AP>, M>>,
        defaultTranslation: string,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
    <PA extends HasNamedArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        named: InferNamedArgsFromPath<FullPath<P, S & Suffixes<AP>, AP>, M>,
        options: TranslateOptions,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;

    // Positional arguments
    <PA extends HasPositionalArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        positional: InferPositionalArgsFromPath<FullPath<P, S & Suffixes<AP>, AP>, M>,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
    <PA extends HasNamedArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        positional: InferPositionalArgsFromPath<FullPath<P, S & Suffixes<AP>, AP>, M>,
        plural: number,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
    <PA extends HasNamedArgs<FullPathOf<P, AP>>, S extends SuffixesOf<P & Prefixes<PA>, PA>>(
        suffixe: S,
        positional: InferPositionalArgsFromPath<FullPath<P, S & Suffixes<AP>, AP>, M>,
        defaultTranslation: string,
    ): TranslationsType<FullPath<P, S & Suffixes<AP>, AP>, LM>;
}

// With Prefixe
export default function useTranslation<P extends Prefixes>(
    prefixe: P,
): TranslationComposerPrefixed<P>;

// Without Prefixe
export default function useTranslation(): TranslateComposer;

// Implementation
export default function useTranslation<
    P extends Prefixes,
    S extends SuffixesOf<P> = SuffixesOf<P>,
    Path extends FullPath<P, S> = FullPath<P, S>,
>(prefixe?: P): TranslationComposerPrefixed<P> | TranslateComposer {
    const { t } = useI18n();

    if (prefixe)
        return (suffixe: S) =>
            t(`${prefixe}${messageKeySeparator}${suffixe}`) as TranslationsType<Path>;
    else return t as TranslateComposer;
}
