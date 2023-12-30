import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const getResponse = (
  res: Response,
  payload?: Record<string, unknown>,
  statusCode = StatusCodes.OK
) => {
  return res.status(statusCode).json({
    success: true,
    ...payload,
  });
};
