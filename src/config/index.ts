import defaultConfig from './default.json';
import deepmerge from 'deepmerge';

class ConfigManager {
  public static config = deepmerge(
    defaultConfig,
    require(`./${process.env.NODE_ENV.replace('-', '.')}.json`)
  );

  //DB 연결 세팅
  public static setConfig(keys: any) {
    ConfigManager.config = deepmerge(ConfigManager.config, {
      db: {
        c_apply: {
          password:
            keys.dbPassword ||
            ConfigManager.config.db.c_apply.password,
        },
        c_member: {
          password:
            keys.dbPassword ||
            ConfigManager.config.db.c_member.password,
        },
        c_transfer: {
          password:
            keys.dbPassword ||
            ConfigManager.config.db.c_transfer.password,
        }
      },
    });
  }
}

export default ConfigManager;
