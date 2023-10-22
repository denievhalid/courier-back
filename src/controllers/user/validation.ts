import * as yup from "yup";
export const createUserValidation = yup
  .object({
    gender: yup.string().required("Обязятельное поле"),
    city: yup.string().required("Обязятельное поле"),
  })
  .noUnknown();
