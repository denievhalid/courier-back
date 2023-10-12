import * as yup from "yup";
export const sendOtpSchema = yup
  .object({
    phoneNumber: yup.number().required("Некорректный номер телефона"),
  })
  .noUnknown();

export const validateOtpSchema = yup
  .object({
    phoneNumber: yup.number().required(),
  })
  .required();
