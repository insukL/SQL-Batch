import ConfigManager from '@/config';

export default class RegexChecker {
  public static async checkQuery(query: string) {
    //따옴표 내 문자 제거
    const extractQuery = query.replace(/((['"])(.|\n)+?\2)|(--.*)/g, '');

    //공백 사이에 있는 문자 검색 정규식
    const banWords = new RegExp(
      `(?<=(\u0020|\n))(${ConfigManager.config.banWord.join(
        '|'
      )})(?=(\u0020|\n))`,
      'gi'
    );

    return banWords.test(extractQuery);
  }
}
