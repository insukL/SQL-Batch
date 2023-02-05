import ConfigManager from '@/config';
import path from 'path';
import moment from 'moment';
import FileHelper from '@/utils/file.helper';

export default class BackupService {
  private pathData = ConfigManager.config.path;

  //날짜가 일주일 이상 지난 폴더 삭제
  public async removeBackup(queryType: string) {
    const date = moment().subtract(7, 'days');

    const oldDirectories = (
      await FileHelper.readDir(path.join(this.pathData.backup, queryType))
    ).filter((name) => {
      return moment(name, 'YYYY_MM_DD').isBefore(date);
    });

    const removePromises = oldDirectories.map((dir) => {
      FileHelper.remove(path.join(this.pathData.backup, queryType, dir));
    });

    await Promise.all(removePromises);
  }

  public async backupResultFile(queryType: string) {
    const date = moment();

    const dirPath = path.join(this.pathData.result, queryType);
    const backupPath = path.join(
      this.pathData.backup,
      queryType,
      date.format('YYYY_MM_DD'),
      date.format('HHmmss')
    );

    await FileHelper.move(dirPath, backupPath);
  }
}
