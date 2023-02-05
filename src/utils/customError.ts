interface CustomErrorType {
  errorMessage: string;
  errorCode: string;
  detail: string;
}

export default class CustomError {
  errorMessage: string;
  errorCode: string;
  detail: any;

  constructor(
    errorMessage: string,
    errorCode?: string | number,
    detail?: string | Object
  ) {
    this.errorMessage = errorMessage;
    this.errorCode = errorCode ? errorCode.toString() : '0';
    this.detail = detail || null;
  }

  public toString() {
    return JSON.stringify(this);
  }
}
