import CustomError from './customError';
import { promises as fs, constants } from 'fs';
import { createReadStream, createWriteStream } from 'fs';
import { Readable } from 'stream';
import path from 'path';
import iconv from 'iconv-lite';
import chardet from 'chardet';

// 파일 입출력(fs) 호출 유틸
export default class FileHelper {
  public static async checkDirectory(dirPath: string) {
    await fs
      .access(dirPath, constants.F_OK | constants.W_OK | constants.R_OK)
      .catch(async (err) => {
        if (err.code === 'ENOENT') {
          await fs.mkdir(dirPath, {
            recursive: true,
          });
          return;
        }
        throw err;
      });
  }

  // 데이터 전체 파일 생성
  public static async write(
    data: any,
    filePath: string,
    encoding: BufferEncoding
  ) {
    await fs
      .writeFile(filePath, data, {
        encoding: encoding,
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          throw new CustomError('저장할 폴더를 찾을 수 없습니다.');
        }
        throw err;
      });
  }

  // 데이터 스트림 파일 생성
  public static async writeByStream(data: string, filePath: string) {
    const readStream = new Readable({
      async read(size) {
        this.push(data);
        this.push(null);
      },
    });

    const writeStream = createWriteStream(filePath);

    readStream.pipe(writeStream).on('end', () => {
      writeStream.end('write end');
    });
  }

  public static async readDir(dirPath: string) {
    return await fs.readdir(dirPath).catch((err) => {
      if (err.code === 'ENOENT') return [];
      if (err.code === 'ENOTDIR') throw new CustomError('잘못된 경로입니다.');
      else throw err;
    });
  }

  public static async readFile(filePath: string) {
    const encoding = await chardet.detectFile(filePath);
    const result = await fs.readFile(filePath).catch((err) => {
      throw err;
    });

    if (encoding.toString() !== 'UTF-8') {
      return iconv.decode(result, encoding.toString()).toString();
    }

    return result.toString('utf-8');
  }

  public static async move(oldPath: string, newPath: string) {
    try {
      const stat = await fs.stat(oldPath);
      await this.checkDirectory(newPath);

      if (stat.isDirectory()) {
        await this.moveDirectory(oldPath, newPath);
      } else {
        await fs.rename(oldPath, newPath);
      }
    } catch (err) {
      if (err.code === 'ENOENT') return;
      throw err;
    }
  }

  private static async moveDirectory(oldDir: string, newDir: string) {
    const files = await fs.readdir(oldDir);

    await Promise.all(
      files.map((file) => {
        return fs.rename(path.join(oldDir, file), path.join(newDir, file));
      })
    );
  }

  public static async remove(path: string) {
    await fs.rm(path, { recursive: true }).catch((err) => {
      if (err.code === 'ENOENT') return;
      else throw err;
    });
  }
}
