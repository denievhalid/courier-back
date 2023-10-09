import { Request, Response } from "express";

export const getResponse = (
  res: Response,
  payload: Record<string, unknown>,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    ...payload,
  });
};
