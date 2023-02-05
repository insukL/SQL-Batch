import ConfigManager from '@/config';
import CustomError from '@/utils/customError';
import path from 'path';
import { promises as fs } from 'fs';
import { SqlConfig } from '@/type/config';

export default class DBConfigManager {
  private static pathData = ConfigManager.config.path;
  private static config: Array<SqlConfig> = [];

  public static getConfig() {
    return this.config;
  }

  public static async loadConfig(type: string) {
    const configNames = await fs.readdir(path.join(this.pathData.config));

    const config = configNames.map((name: string) => {
      return this.readConfig(name, this.pathData.config);
    });

    this.config = (await Promise.all(config)).filter((data) => {
      return data.file.type === type;
    });
  }

  private static async readConfig(fileName: string, filePath: string) {
    try {
      const config = JSON.parse(
        await fs.readFile(path.join(filePath, fileName), 'utf-8')
      );

      return config;
    } catch (err) {
      if (err.name == 'SyntaxError') {
        throw new CustomError('설정 파일에 문법 오류가 있습니다.');
      } else throw err;
    }
  }
}
