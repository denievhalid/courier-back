import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let payload: any = {
    errors: [],
  };

  res.status(500);

  return res.json({ ...payload });
};
