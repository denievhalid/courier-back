import yup from "yup";

export const userCreationSchema = yup.object().shape({
  firstname: yup.string().trim().required(),
});
