import z from 'zod';

export enum LogLevel {
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Success = 'success',
    Message = 'message',
    Debug = 'debug',
}

export const LOG_LEVELS = Object.values(LogLevel);
export const LOG_LEVELS_METHOD = {
    [LogLevel.Error]: console.error,
    [LogLevel.Warning]: console.warn,
    [LogLevel.Info]: console.info,
    [LogLevel.Success]: console.log,
    [LogLevel.Message]: console.log,
    [LogLevel.Debug]: console.debug,
};

export const zLogSettings = z.object({
    level: z.enum(LogLevel).default(LogLevel.Info),
});
export type LogSettings = z.infer<typeof zLogSettings>;

export class Logger {
    private static FORMATS = {
        error: 'background:red; color:white; padding:2px 4px; border-radius:3px;',
        warning: 'background:orange; color:black; padding:2px 4px; border-radius:3px;',
        info: 'background:blue; color:white; padding:2px 4px; border-radius:3px;',
        success: 'background:green; color:white; padding:2px 4px; border-radius:3px;',
        message: 'background:gray; color:white; padding:2px 4px; border-radius:3px;',
        debug: 'background:purple; color:white; padding:2px 4px; border-radius:3px;',
    };

    private static async log(level: LogLevel, ...messages: any[]) {
        const header = `%c[UJC][${level.toUpperCase()}]`;
        LOG_LEVELS_METHOD[level](header, Logger.FORMATS[level], ...messages);
    }

    public static error = Logger.log.bind(this, LogLevel.Error);
    public static warning = Logger.log.bind(this, LogLevel.Warning);
    public static info = Logger.log.bind(this, LogLevel.Info);
    public static success = Logger.log.bind(this, LogLevel.Success);
    public static message = Logger.log.bind(this, LogLevel.Message);
    public static debug = Logger.log.bind(this, LogLevel.Debug);
}
