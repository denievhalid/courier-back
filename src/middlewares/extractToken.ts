import _ from "lodash";
import type { RequestHandler } from "express";

export const extractToken: RequestHandler = (req, res, next) => {
  let token: string | null = null;

  if (req.headers && req.headers.authorization) {
    const parts = _.split(req.headers.authorization, " ");

    if (parts.length === 2 && parts[0]!.toLowerCase() === "bearer") {
      token = parts[1]!;
    }
  }

  _.set(req, "token", token);
  next();
};
