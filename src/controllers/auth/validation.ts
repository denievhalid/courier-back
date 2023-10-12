import * as yup from "yup";
export const sendOtpSchema = yup
  .object({
    phoneNumber: yup.number().required("Обязательное поле"),
  })
  .noUnknown();

export const validateOtpSchema = yup
  .object({
    phoneNumber: yup.number().required(),
  })
  .required();
