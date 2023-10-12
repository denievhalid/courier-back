import { ValidationError } from "yup";

export const isYupError = (error: Error): boolean => {
  return error instanceof ValidationError;
};
