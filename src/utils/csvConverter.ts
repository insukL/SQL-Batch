import FileHelper from './file.helper';
import iconv from 'iconv-lite';
import chardet from 'chardet';

export default class CsvConverter {
  public static async saveDataByCSV(data: any[][], path: string, seq: string) {
    const header = Object.keys(data[0]).join(seq);

    const body = data.map((row) => {
      return Object.values(row)
        .map((value) => {
          return JSON.stringify(value);
        })
        .join(seq);
    });

    console.log('join');

    let csvResult = header + '\n' + body.join('\n');
    const encoding = chardet.detect(Buffer.from(body[0]));

    if (encoding !== 'UTF-8') {
      csvResult = iconv.decode(Buffer.from(csvResult), encoding).toString();
    }

    console.log('encode');

    return await FileHelper.writeByStream(csvResult, path);
  }
}
