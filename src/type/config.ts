import { DbName } from './db';

export type SqlConfig = {
  db: {
    database: DbName;
  };
  file: {
    sql: string;
    result: string;
    type: string;
  };
};
