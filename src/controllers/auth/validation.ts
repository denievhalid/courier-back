import * as yup from "yup";
export const sendOtpSchema = yup
  .object({
    phoneNumber: yup
      .number()
      .min(10, "Некорректный номер телефона")
      .required("Некорректный номер телефона"),
  })
  .noUnknown();

export const verifyOtpSchema = yup
  .object({
    otp: yup.number().required(),
    phoneNumber: yup.number().required(),
  })
  .noUnknown();
