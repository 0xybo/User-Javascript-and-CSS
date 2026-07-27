import z from 'zod';

/**
 * An enumeration of log levels.
 */
export enum LogLevel {
    /** An error message. */
    Error = 'error',
    /** A warning message. */
    Warning = 'warning',
    /** An info message. */
    Info = 'info',
    /** A success message. */
    Success = 'success',
    /** A general message. */
    Message = 'message',
    /** A debug message. */
    Debug = 'debug',
}

/**
 * List of log levels in order of severity.
 */
export const LOG_LEVELS = Object.values(LogLevel);

/**
 * A mapping of log levels to their corresponding console methods.
 */
export const LOG_LEVELS_METHOD = {
    [LogLevel.Error]: console.error,
    [LogLevel.Warning]: console.warn,
    [LogLevel.Info]: console.info,
    [LogLevel.Success]: console.log,
    [LogLevel.Message]: console.log,
    [LogLevel.Debug]: console.debug,
};

/**
 * A Zod schema for validating log settings.
 */
export const zLogSettings = z.object({
    level: z.enum(LogLevel).default(LogLevel.Info),
});

/**
 * A TypeScript type representing the log settings, inferred from the Zod schema.
 */
export type LogSettings = z.infer<typeof zLogSettings>;

/**
 * A logger class that provides methods for logging messages at different log levels. The logger formats the messages with a header indicating the log level and applies specific styles to each log level for better visibility in the console.
 */
export class Logger {
    /**
     * A mapping of log levels to their corresponding CSS styles for console output.
     * Each log level has a unique background color and text color to differentiate it from other log levels.
     */
    private static FORMATS = {
        error: 'background:red; color:white; padding:2px 4px; border-radius:3px;',
        warning: 'background:orange; color:black; padding:2px 4px; border-radius:3px;',
        info: 'background:blue; color:white; padding:2px 4px; border-radius:3px;',
        success: 'background:green; color:white; padding:2px 4px; border-radius:3px;',
        message: 'background:gray; color:white; padding:2px 4px; border-radius:3px;',
        debug: 'background:purple; color:white; padding:2px 4px; border-radius:3px;',
    };
    /**
     * A CSS style string used to reset the console output formatting after a log message is printed. This ensures that subsequent console messages are not affected by the styles applied to the log messages.
     * The reset format removes any background color, text color, padding, and border radius applied to the log messages.
     */
    private static RESET_FORMAT = 'background:none; color:inherit; padding:0; border-radius:0;';

    /**
     * Logs a message to the console at the specified log level. The message is formatted with a header indicating the log level and applies specific styles to each log level for better visibility in the console.
     *
     * @param level The log level at which to log the message. This determines the console method used and the formatting applied to the message.
     * @param messages The messages to log. The first message can be a string that will be concatenated with the header, while subsequent messages can be of any type and will be logged as-is.
     */
    private static async log(level: LogLevel, ...messages: unknown[]) {
        const header = `%c[UJC][${level.toUpperCase()}]%c`;
        const firstMessage = messages.shift();

        if (typeof firstMessage === 'string')
            // Log the message with the first message concatenated to the header
            // Add support for formatting and substitutions
            LOG_LEVELS_METHOD[level](
                header + ' ' + firstMessage,
                Logger.FORMATS[level],
                Logger.RESET_FORMAT,
                ...messages,
            );
        else
            LOG_LEVELS_METHOD[level](
                header,
                Logger.FORMATS[level],
                Logger.RESET_FORMAT,
                ...messages,
            );
    }

    /**
     * Logs an error message to the console. This method is a shorthand for calling the `log` method with the `Error` log level.
     *
     * @param messages The messages to log. The first message can be a string that will be concatenated with the header, while subsequent messages can be of any type and will be logged as-is.
     */
    public static error = Logger.log.bind(this, LogLevel.Error);

    /**
     * Logs a warning message to the console. This method is a shorthand for calling the `log` method with the `Warning` log level.
     *
     * @param messages The messages to log. The first message can be a string that will be concatenated with the header, while subsequent messages can be of any type and will be logged as-is.
     */
    public static warning = Logger.log.bind(this, LogLevel.Warning);

    /**
     * Logs an info message to the console. This method is a shorthand for calling the `log` method with the `Info` log level.
     *
     * @param messages The messages to log. The first message can be a string that will be concatenated with the header, while subsequent messages can be of any type and will be logged as-is.
     */
    public static info = Logger.log.bind(this, LogLevel.Info);

    /**
     * Logs a success message to the console. This method is a shorthand for calling the `log` method with the `Success` log level.
     *
     * @param messages The messages to log. The first message can be a string that will be concatenated with the header, while subsequent messages can be of any type and will be logged as-is.
     */
    public static success = Logger.log.bind(this, LogLevel.Success);

    /**
     * Logs a general message to the console. This method is a shorthand for calling the `log` method with the `Message` log level.
     *
     * @param messages The messages to log. The first message can be a string that will be concatenated with the header, while subsequent messages can be of any type and will be logged as-is.
     */
    public static message = Logger.log.bind(this, LogLevel.Message);

    /**
     * Logs a debug message to the console. This method is a shorthand for calling the `log` method with the `Debug` log level.
     *
     * @param messages The messages to log. The first message can be a string that will be concatenated with the header, while subsequent messages can be of any type and will be logged as-is.
     */
    public static debug = Logger.log.bind(this, LogLevel.Debug);
}
