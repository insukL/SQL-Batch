import SqlConfigManager from '@/utils/sql.config.manager';
import QueryService from '@/service/query.service';
import BackupService from '@/service/backup.service';
import Logger from '@/utils/logger';
import { checkIp } from '@/middleware/ipChecker';
import { Request, Response, NextFunction, Router } from 'express';
import ConfigManager from '@/config';

export default class QueryController {
  public router: Router;
  private basePath: string = '';

  constructor(basePath: string, router: Router) {
    this.router = router;
    this.basePath = basePath;

    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.use(
      `${this.basePath}`,
      checkIp(ConfigManager.config.ip.internal)
    );
    this.router.post(
      `${this.basePath}`,
      (req: Request, res: Response, next: NextFunction) => {
        Logger.accessLogger.info({
          accessIP: res.locals.ip,
          requestURI: req.url,
        });

        next();
      },
      this.getQueryResult
    );
  }

  private async getQueryResult(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.status(200).end(`Request OK`);

    try {
      const type = req.query.type as string;
      await SqlConfigManager.loadConfig(type);

      //오래된 백업 삭제, 현재 파일 백업
      const backupService = new BackupService();
      await backupService.removeBackup(type);
      await backupService.backupResultFile(type);

      const queryService = new QueryService();
      await queryService.saveQueryResults();
    } catch (err) {
      next(err);
    }
  }
}
