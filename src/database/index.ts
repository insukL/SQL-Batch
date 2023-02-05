import ConfigManager from '@/config';
import { DbName } from '@/type/db';
import { ResultData } from './db.result';
import { QueryOptions, Sequelize, Transaction } from 'sequelize';

export default class Database {
  private static dbConnList: Partial<{ [key in DbName]: any }> = {};

  public static async run() {
    this.setDbConnections();
  }

  public static async setDbConnections() {
    const config = ConfigManager.config.db as any;

    await Promise.all(
      Object.keys(config).map((db: DbName) => {
        return new Promise<void>((resolve, reject) => {
          try {
            this.dbConnList[db] = new Sequelize({
              ...config[db],
              isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      })
    );
  }

  public static dbConn(dbName: DbName): Sequelize {
    try {
      return this.dbConnList[dbName];
    } catch (error) {
      console.log('Get DB Connection Error');
    }
  }

  public static getRowCount(dbName: DbName, result: any) {
    const rowCount =
      this.dbConnList[dbName].options.dialect === 'postgres'
        ? result[1].rowCount
        : result[1];
    return rowCount;
  }

  //row query - select만 사용하므로 transaction 쿼리는 없음
  public static async query(
    dbName: DbName,
    query: string | { query: string; values: any[] },
    params?: { [key: string]: any },
    options: QueryOptions = {}
  ) {
    const result = await this.dbConn(dbName).query(query, {
      bind: params,
      ...options,
    });
    return new ResultData(result[0], this.getRowCount(dbName, result));
  }
}
