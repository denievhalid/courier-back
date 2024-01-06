import { authenticator } from "otplib";
import { Models, OtpType } from "@/types";
import { getModel } from "@/lib/container";
import dayjs from "dayjs";
import _ from "lodash";
import { BaseService } from "@/services/base";

export const options = {
  digits: 4,
  epoch: 60,
};

authenticator.options = {
  digits: options.digits,
  epoch: options.epoch,
};

export class OtpService extends BaseService {
  constructor() {
    super(getModel(Models.OTP));
  }

  generateOtp() {
    const secret = authenticator.generateSecret();
    const otp = authenticator.generate(secret);

    return {
      otp,
      secret,
    };
  }

  verify(otp: string, secret: string) {
    return authenticator.check(otp, secret);
  }

  getDeadline() {
    const date = new Date();
    return date.setSeconds(date.getSeconds() + options.epoch);
  }

  getOtpPayload(payload: OtpType) {
    const deadline = dayjs(_.get(payload, "deadline"));
    let timeout = deadline.diff(dayjs(), "second");

    if (timeout < 1) {
      timeout = 0;
    }

    return {
      deadline,
      otpLength: payload.otp.toString().length,
      timeout,
    };
  }
}
