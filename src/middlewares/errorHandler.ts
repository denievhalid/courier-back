import type { ErrorRequestHandler } from "express";
import { MongooseError } from "mongoose";
import { ValidationError } from "yup";
import { isYupError, mapYupTErrors } from "@/lib/error";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(111);
  const payload: any = {
    errors: {
      name: err.name,
      message: err.message,
      details: err.details,
    },
  };

  res.status(500);

  console.log(err.message);

  if (isYupError(err)) {
    payload.errors = mapYupTErrors(err);
    res.status(400);
  }

  return res.json({ success: false, ...payload });
};
