import SqlConfigManager from '@/utils/sql.config.manager';
import CsvConverter from '@/utils/csvConverter';
import ConfigManager from '@/config';
import Database from '@/database';
import { SqlConfig } from '@/type/config';
import CustomError from '@/utils/customError';
import Logger from '@/utils/logger';
import FileHelper from '@/utils/file.helper';
import RegexChecker from '@/utils/regex.checker';
import { DbName } from '@/type/db';
import path from 'path';

export default class QueryService {
  private pathData = ConfigManager.config.path;

  public async saveQueryResults() {
    const config = SqlConfigManager.getConfig();

    const promises = config.map((data) => {
      return this.saveData(data)
        .then((data) => {
          count.success += 1;
          return data;
        })
        .catch((err) => {
          count.failure += 1;
          Logger.errorLogger(err, { sql: data.file.sql });
        });
    });

    const count = {
      success: 0,
      failure: 0,
    };

    const result = await Promise.all(promises);

    Logger.resultLogger.info({
      result: result.filter((data) => Boolean(data)),
      count,
    });
  }

  //단일 정보에 대한 결과 저장
  private async saveData(config: SqlConfig) {
    const query = await this.getQueryFromFile(config);
    const queryResult = await this.getQueryResult(config.db.database, query);

    return await this.saveDataByCSV(
      queryResult,
      path.join(this.pathData.result, config.file.type),
      config.file.result
    );
  }

  //쿼리 읽기
  private async getQueryFromFile(config: SqlConfig) {
    const filePath = path.join(this.pathData.sql, config.file.sql);
    const sql = FileHelper.readFile(filePath);

    return await sql;
  }

  // 쿼리 실행
  private async getQueryResult(database: DbName, sql: string) {
    if (await RegexChecker.checkQuery(sql)) {
      throw new CustomError('사용할 수 없는 SQL 구문이 포함되어 있습니다.');
    }

    const result = await Database.query(database, sql);
    return result.all();
  }

  // CSV형태 저장
  private async saveDataByCSV(data: any[][], basePath: string, name: string) {
    const filePath = path.join(basePath, name);
    await FileHelper.checkDirectory(basePath);

    await CsvConverter.saveDataByCSV(data, filePath, ',');

    return filePath;
  }
}
