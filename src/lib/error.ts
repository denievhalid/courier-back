import { ValidationError } from "yup";

export const isYupError = (error: Error): boolean => {
  return error instanceof ValidationError;
};

export const mapYupTErrors = (err: { inner: any[] }) => {
  return err.inner
    .filter((i: { message: any }) => Boolean(i.message))
    .reduce(
      (curr: any, next: { path: any; errors: any[] }) => ({
        ...curr,
        [next.path]: next.errors?.[0],
      }),
      {}
    );
};
