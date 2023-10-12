import type { ErrorRequestHandler } from "express";
import { ValidationError } from "yup";
import { isYupError } from "@/lib/error";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const payload: any = {
    errors: [],
  };

  res.status(500);

  if (isYupError(error)) {
    payload.errors = error.errors;
    res.status(400);
  }

  return res.json({ success: false, ...payload });
};
