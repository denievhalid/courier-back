import type { RequestHandler, Request, Response, NextFunction } from "express";
import { ValidationError } from "yup";

export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
