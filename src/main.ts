import ExpressApp from '@/express.app';
import KeyManager from './utils/key.manager';
import Database from '@/database';
import Logger from './utils/logger';

(async () => {
  await KeyManager.setKeys();

  await Database.run();

  const server = await new ExpressApp().run();

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
})().catch((err) => {
  Logger.unknownErrorLogger.error({
    error: err,
    position: 'main.ts',
  });
  throw err;
});
