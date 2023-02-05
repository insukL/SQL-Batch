import ConfigManager from '@/config';
import axios from 'axios';
import https from 'https';
import Logger from './logger';

export default class KeyManager {
  public static async setKeys() {
    const catchKv = await axios
      .get(ConfigManager.config.keyManager.db.url, {
        headers: {
          'X-Vault-Token': ConfigManager.config.keyManager.db.token,
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      })
      .then((res) => {
        const data = res.data.data;
        const keys: any = {};
        keys.dbPassword = data['db-password'];

        ConfigManager.setConfig(keys);
      })
      .catch((error) => {
        Logger.unknownErrorLogger.info({
          error: error,
          position: 'main.ts',
        });
        process.exit(1);
      });
  }
}
