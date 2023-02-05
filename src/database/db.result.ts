export class ResultData {
  private data: any[] = null;
  private rowCount: number = null;

  constructor(data: any[], rowCount: number) {
    this.data = data;
    this.rowCount = rowCount;
  }

  // DB 모든 결과 (Array)
  all() {
    if (this.data.length >= 1) {
      const tmpKeys = Object.keys(this.data[0]);
      if (tmpKeys[0].startsWith('JSON_')) {
        const longData = this.data.map((v) => v[tmpKeys[0]]).join('');
        const parsedJson = JSON.parse(longData);
        return this.jsonFilter(parsedJson);
      }
    }
    return this.data;
  }

  // DB 결과 값 하나 (Object)
  one() {
    if (this.data.length === 0) return null;

    if (this.data.length >= 1) {
      const tmpKeys = Object.keys(this.data[0]);
      if (tmpKeys[0].startsWith('JSON_')) {
        const longData = this.data.map((v) => v[tmpKeys[0]]).join('');
        const parsedJson = JSON.parse(longData);
        return this.jsonFilter(
          parsedJson.length > 1
            ? parsedJson
            : parsedJson.length === 0
            ? null
            : parsedJson[0]
        );
      }
    }

    if (this.data.length > 1) return this.data;

    const tmp = this.data[0];
    const tmpKeys = Object.keys(tmp);
    if (tmpKeys.length === 0) return null;
    return tmp;
  }

  // 갯수
  count() {
    return this.rowCount;
  }

  private jsonFilter(data: any): any {
    return Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (
          typeof value === 'object' &&
          value !== null &&
          value !== undefined
        ) {
          if (
            Array.isArray(value) &&
            value.length === 1 &&
            Object.entries(value[0]).find((v) => v[1] !== null) === undefined
          ) {
            acc[key] = [];
            return acc;
          }
          Array.isArray(acc)
            ? acc.push(this.jsonFilter(value))
            : (acc[key] = this.jsonFilter(value));
          return acc;
        }
        const newVal =
          typeof value === 'string' &&
          /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(([+-]\d\d:\d\d|Z))?$/.exec(
            value
          )
            ? new Date(value)
            : value;
        if (Array.isArray(acc)) acc.push(newVal);
        else acc[key] = newVal;
        return acc;
      },
      Array.isArray(data) ? [] : ({} as any)
    );
  }
}
