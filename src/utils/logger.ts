import pino, { Logger, LoggerOptions, LogFn } from 'pino';
import { env } from '../config/env.config';

const isProduction = env.nodeEnv === 'production';

/**
 * This hook captures all arguments passed to logger.*(...args),
 * converts them to strings, and combines them in the order received.
 */
const untypedHooks = {
  logMethod(this: Logger, args: unknown[], method: LogFn, level: number) {
    // Convert each argument to a string
    const combinedMessage = args
      .map((arg) => {
        if (arg === null || arg === undefined) return String(arg);
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (err) {
            return '[Unstringifiable Object]';
          }
        }
        return String(arg);
      })
      .join(' ');

    // Call the original pino method with the single combined message
    return method.call(this, combinedMessage);
  },
};

// Cast to match Pino's types, since we're overriding the usual signature
const hooks = untypedHooks as unknown as LoggerOptions['hooks'];

const formatters: LoggerOptions['formatters'] = {
  level(label) {
    return { level: label };
  },
};

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  hooks,
  formatters,
  // In dev, use pino-pretty for colorized logs
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});

/**
 * EXAMPLE USAGE
 *
 * // Multiple arguments in any order:
 * logger.info('Hello', 'World', { foo: 'bar' }, [1, 2, 3], new Error('Boom!'));
 *
 * // The final log line will look something like:
 * // [INFO] Hello World {"foo":"bar"} [1,2,3] {"name":"Error","message":"Boom!","stack":"..."}
 *
 * // Note: This is all one string message, so you lose Pino's structured JSON fields.
 */
