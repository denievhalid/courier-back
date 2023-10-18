import type { ErrorRequestHandler } from "express";
import { MongooseError } from "mongoose";
import { ValidationError } from "yup";
import { isYupError, mapYupTErrors } from "@/lib/error";
import { StatusCodes } from "http-status-codes";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const payload: any = {
    errors: {
      name: err.name,
      message: err.message,
      details: err.details,
    },
  };

  res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR);

  if (isYupError(err)) {
    payload.errors = mapYupTErrors(err);
    res.status(400);
  }

  return res.json({ success: false, ...payload });
};
