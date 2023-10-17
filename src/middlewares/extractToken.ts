import { split } from "lodash";
import type { RequestHandler } from "express";

export const extractToken: RequestHandler = (req, _res, next) => {
  let token: string | null = null;

  if (req.headers && req.headers.authorization) {
    const parts = split(req.headers.authorization, " ");

    if (parts.length === 2 && parts[0]!.toLowerCase() === "bearer") {
      token = parts[1]!;
    }
  }

  // @ts-ignore
  req.token = token;
  next();
};
