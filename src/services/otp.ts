import { authenticator } from "otplib";
import { OtpType } from "@/types";
import { getModel } from "@/lib/container";
import dayjs from "dayjs";
import _ from "lodash";

type VerifyType = {
  otp: string;
  secret: string;
};

export const options = {
  digits: 4,
  epoch: 60,
};

authenticator.options = {
  digits: options.digits,
  epoch: options.epoch,
};

export const generateOtp = () => {
  const secret = authenticator.generateSecret();
  const otp = authenticator.generate(secret);

  return {
    otp,
    secret,
  };
};

export const create = (payload: OtpType) => {
  return getModel("otp").create(payload);
};

export const findOne = (payload: OtpType) => {
  return getModel("otp").findOne(payload);
};

export const remove = ({ phoneNumber }: OtpType) => {
  return getModel("otp").findOneAndRemove({ phoneNumber });
};

export const verify = (otp: string, secret: string) => {
  return authenticator.check(otp, secret);
};

export const getDeadline = () => {
  const date = new Date();
  return date.setSeconds(date.getSeconds() + options.epoch);
};

export const getOtpPayload = (payload: OtpType) => {
  const deadline = dayjs(_.get(payload, "deadline"));
  let timeout = deadline.diff(dayjs(), "second");

  if (timeout < 1) {
    timeout = 0;
  }

  return {
    timeout,
  };
};
