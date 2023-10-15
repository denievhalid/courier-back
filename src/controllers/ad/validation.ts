import * as yup from "yup";
export const createFormSchema = yup
  .object({
    title: yup.number().required("Обязятельное поле"),
    weight: yup.number().required("Обязятельное поле"),
    date: yup.date().required("Обязятельное поле"),
    files: yup.array().required("Обязятельное поле"),
  })
  .noUnknown();
