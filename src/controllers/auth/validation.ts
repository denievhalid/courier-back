import * as yup from "yup";
export const sendOtpSchema = yup
  .object({
    phoneNumber: yup.number().required(),
  })
  .noUnknown();

export const validateOtpSchema = yup
  .object({
    otp: yup.number().required(),
  })
  .noUnknown();
