import { BaseException } from "@/exceptions/base";
import { ERROR_CODES } from "./consts";

export class InvalidCredentialsException extends BaseException {
  constructor(message = "Invalid user credentials.") {
    super(message, 401, ERROR_CODES.INVALID_CREDENTIALS);
    this.errorCode = 1000;
  }
}

export class CourierExistsException extends BaseException {
  constructor(message = "Invalid user credentials.") {
    super(message, 400, ERROR_CODES.COURIER_NOT_FOUND);
    this.errorCode = 2000;
  }
}

export class AdNotFoundException extends BaseException {
  constructor(message = "Invalid user credentials.") {
    super(message, 400, ERROR_CODES.AD_NOT_FOUND);
    this.errorCode = 3000;
  }
}
