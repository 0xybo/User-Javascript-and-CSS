import { Logger } from '../logger';

/**
 * A constant indicating whether the application is running in development mode.
 */
export const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * A constant indicating whether the application is running in production mode.
 */
export const IS_PRODUCTION = import.meta.env.PROD;

declare global {
    interface Window {
        /**
         * A global object for development purposes, used to store and access certain values or objects directly from the browser console during development.
         */
        ujc?: Record<string, unknown>;
    }
}

/**
 * Declares a global variable on the `window.ujc` object for development purposes. This allows developers to access certain values or objects directly from the browser console during development.
 *
 * @param name The name of the global variable to declare.
 * @param value The value to assign to the global variable.
 */
export function declareGlobalForDevelopment(name: string, value: unknown): void {
    if (!IS_DEVELOPMENT) return;

    if (!window.ujc) {
        Object.defineProperty(window, 'ujc', {
            value: {},
            writable: false,
            enumerable: true,
            configurable: false,
        });

        Logger.info(
            'Development mode: global object "window.ujc" has been created for debugging purposes.',
        );
    }

    Object.defineProperty(window.ujc, name, {
        value,
        writable: true,
        enumerable: true,
        configurable: false,
    });
}
