import CustomError from '@/utils/customError';
import Logger from '@/utils/logger';
import { Request, Response, NextFunction } from 'express';

export default class ErrorHandler {
  public static catchError(
    error: CustomError | Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const ip = res.locals.ip;

    if (error instanceof CustomError) {
      Logger.customErrorLogger.error({ error, ip });
    } else {
      Logger.unknownErrorLogger.error({
        name: error.name,
        message: error.message,
        ip,
      });
    }
  }
}
