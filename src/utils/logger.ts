import ConfigManager from '@/config';
import Winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import moment from 'moment';
import CustomError from './customError';

export default class Logger {
  private static path = ConfigManager.config.path.logs;

  public static customErrorLogger = Winston.createLogger({
    format: Winston.format.combine(
      Winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      Winston.format.json()
    ),

    transports: [
      new WinstonDaily({
        dirname: `${Logger.path}/customError`,
        filename: `custom_error_%DATE%.log`,
        datePattern: 'YYYYMMDD',
      }),
    ],
  });

  public static unknownErrorLogger = Winston.createLogger({
    format: Winston.format.combine(
      Winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      Winston.format.json()
    ),

    transports: [
      new WinstonDaily({
        dirname: `${Logger.path}/unknownError`,
        filename: `unknown_error_%DATE%.log`,
        datePattern: 'YYYYMMDD',
      }),
    ],
  });

  public static accessLogger = Winston.createLogger({
    format: Winston.format.printf((info) => {
      return this.getLogMessage(info.message);
    }),

    transports: [
      new WinstonDaily({
        dirname: `${Logger.path}/access`,
        filename: `access_%DATE%.log`,
        datePattern: 'YYYYMMDD',
      }),
    ],
  });

  public static resultLogger = Winston.createLogger({
    format: Winston.format.combine(
      Winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      Winston.format.json()
    ),

    transports: [
      new WinstonDaily({
        dirname: `${Logger.path}/result`,
        filename: `result_%DATE%.log`,
        datePattern: 'YYYYMMDD',
      }),
    ],
  });

  private static getLogMessage(message: Object) {
    const logDate = moment().format('YYYY-MM-DD HH:mm:ss');

    const log = logDate.concat('|').concat(Object.values(message).join('|'));
    return log;
  }

  public static errorLogger(
    err: CustomError | Error,
    info?: { [key: string]: any }
  ) {
    if (err instanceof CustomError) {
      this.customErrorLogger.error({
        ...err,
        ...info,
      });
    } else
      this.unknownErrorLogger.error({
        name: err.name,
        ...info,
        message: err.message,
      });
  }
}
