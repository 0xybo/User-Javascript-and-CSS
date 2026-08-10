import type { I18nOptions, LinkedModifiers, VueMessageType } from 'vue-i18n';
import type Messages from './_schema';
import enUS from './en-US';
import frFR from './fr-FR';

const modifiers = {
    plural: (str: string) => str.split('|').pop() as string,
} as LinkedModifiers<VueMessageType>;

export const locales = {
    'en-US': {
        name: 'English (US)',
        alias: ['en', 'en-GB'],
        flag: '🇺🇸',
        messages: enUS,
    },
    'fr-FR': {
        name: 'Français (FR)',
        alias: ['fr', 'fr-CA'],
        flag: '🇫🇷',
        messages: frFR,
    },
};

export const defaultLocale = 'en-US' as const;

const fallbackLocale: I18nOptions['fallbackLocale'] = {
    default: [defaultLocale],
};
for (const locale in locales) {
    const { alias } = locales[locale as keyof typeof locales];
    if (!Array.isArray(alias)) continue;
    for (const a of alias) {
        fallbackLocale[a] = [locale];
    }
}

export default {
    legacy: false,
    locale: defaultLocale,
    fallbackLocale,
    messages: Object.fromEntries(
        Object.entries(locales).map(([locale, { messages }]) => [locale, messages]),
    ),
    modifiers,
} as const satisfies I18nOptions;

export const messageKeySeparator = '.' as const;
export type MessageKeySeparator = typeof messageKeySeparator;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MessagesType = Record<string, any>;

export type Localized<T> = {
    [k: string]: T;
};

/**
 * Messages organized by language.
 */
export type LocalizedMessages = Localized<Messages>;

export type LocalizedMessagesType = Localized<MessagesType>;

/**
 * Extrait les noms des arguments nommés d'une chaîne de caractères.
 *
 * @template S - Chaîne de caractères
 *
 * @example
 * type Test = InferNamedArgsNames<'Hello {name}, you have {count} unread messages.'>
 * // Test = ['name', 'count']
 */
export type InferNamedArgsNames<S extends string> = S extends `${string}{${infer Arg}}${infer Rest}`
    ? [Arg, ...InferNamedArgsNames<Rest>]
    : [];

/**
 * Extrait les arguments nommés d'une chaîne de caractères.
 *
 * @template S - Chaîne de caractères
 *
 * @example
 * type Test = InferNamedArgs<'Hello {name}, you have {count} unread messages.'>
 * // Test = { name: any, count: any }
 */
export type InferNamedArgs<S extends string> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in InferNamedArgsNames<S>[number]]: any;
};

/**
 * Donne le type d'une clé de traduction.
 *
 * @template P - Chemin de la clé de traduction
 * @template O - Ensemble des messages
 *
 * @example
 * type Test = TranslationString<'common.help'>
 * // Test = string
 */
export type TranslationString<
    P extends string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    O extends Record<string, any> = Messages[keyof Messages],
> = P extends `${infer Key}${MessageKeySeparator}${infer Rest}`
    ? Key extends keyof O
        ? TranslationString<Rest, O[Key]>
        : never
    : P extends keyof O
      ? O[P]
      : never;

/**
 * Filtre les clés de traduction avec des arguments nommés.
 *
 * @template S - Ensemble des clés de traduction
 *
 * @example
 * type Test = WithNamedArgs<'Help' | 'You have {count} new message'>
 * // Test = 'You have {count} new message'
 */
export type WithNamedArgs<S extends string> = {
    [K in S]: TranslationString<K> extends `${string}{${number}}${string}`
        ? never
        : TranslationString<K> extends `${string}{${string}}${string}`
          ? K
          : never;
}[S];

/**
 * Filtre les clés de traduction avec des arguments positionnels.
 *
 * @template S - Ensemble des clés de traduction
 *
 * @example
 * type Test = WithPositionalArgs<'Help' | 'Hello {0}, you have {1} unread messages.'>
 * // Test = 'Hello {0}, you have {1} unread messages.'
 */
export type WithPositionalArgs<S extends string> = {
    [K in S]: TranslationString<K> extends `${string}{${number}}${string}` ? K : never;
}[S];

/**
 * Filtre les clés de traduction sans arguments.
 *
 * @template S - Ensemble des clés de traduction
 *
 * @example
 * type Test = WithoutArgs<'Help' | 'You have {count} new message'>
 * // Test = 'Help'
 */
export type WithoutArgs<S extends string> = {
    [K in S]: TranslationString<K> extends `${string}{${number}}${string}`
        ? never
        : TranslationString<K> extends `${string}{${string}}${string}`
          ? never
          : K;
}[S];

/**
 * Extrait les arguments positionnels d'une chaîne de caractères.
 *
 * @template S - Chaîne de caractères
 *
 * @example
 * type Test = InferPositionalArgs<'Hello {0}, you have {1} unread messages.'>
 * // Test = [0, 1]
 */
export type InferPositionalArgs<S extends string> = S extends `${string}{${number}}${infer Rest}`
    ? [number, ...InferPositionalArgs<Rest>]
    : [];
