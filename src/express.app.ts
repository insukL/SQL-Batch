import ConfigManager from './config';
import clientIP from './middleware/clientIP';
import FileHelper from './utils/file.helper';
import ErrorHandler from './middleware/error.handler';
import Controller from '@/controller';
import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import { resolveConfig } from 'prettier';

export default class ExpressApp {
  public app;
  public server: Server = null;

  constructor() {
    this.app = express();
    this.setHeader();
    this.setMiddleware();
    this.setController();
    this.setErrorHandler();

    this.checkEssentialDir();
  }

  public async run() {
    return (this.server = this.app.listen(
      ConfigManager.config.express.port,
      () => {
        console.log(
          `App listening at http://127.0.0.1:${ConfigManager.config.express.port}`
        );
      }
    ));
  }

  private setMiddleware() {
    this.app.use(clientIP);
  }

  private setController() {
    this.app.use('', new Controller().router);
  }

  private setErrorHandler() {
    this.app.use(ErrorHandler.catchError);
  }

  private setHeader() {
    this.app.use(function (
      request: Request,
      response: Response,
      next: NextFunction
    ) {
      response.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.header('Cache-Control', 'no-cache');
      response.header('Expires', '-1');
      response.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
      );
      next();
    });
  }

  private async checkEssentialDir() {
    await FileHelper.checkDirectory(ConfigManager.config.path.config);
    await FileHelper.checkDirectory(ConfigManager.config.path.sql);
  }

  public close() {
    return new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else resolve();
      });
    });
  }
}
