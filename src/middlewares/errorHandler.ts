import type { ErrorRequestHandler } from "express";
import { ValidationError } from "yup";
import { isYupError, mapYupTErrors } from "@/lib/error";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const payload: any = {
    errors: [],
  };

  res.status(500);

  console.log(err instanceof ValidationError);

  if (isYupError(err)) {
    payload.errors = mapYupTErrors(err);
    res.status(400);
  }

  return res.json({ success: false, ...payload });
};
