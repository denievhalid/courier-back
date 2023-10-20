import * as yup from "yup";
export const adFormSchema = yup
  .object({
    title: yup.string().required("Обязятельное поле"),
    weight: yup.string().required("Обязятельное поле"),
    date: yup.date().required("Обязятельное поле"),
    from: yup.string().required("Обязятельное поле"),
    to: yup.string().required("Обязятельное поле"),
    images: yup.array().required("Обязятельное поле"),
  })
  .noUnknown();
