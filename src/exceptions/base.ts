export class BaseException extends Error {
  status: number;
  code: string;
  extensions: Record<string, any>;
  errorCode?: number;

  constructor(
    message: string,
    status: number,
    code: string,
    extensions?: Record<string, any>,
    errorCode?: number
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.extensions = extensions || {};
    this.errorCode = errorCode;
  }
}
