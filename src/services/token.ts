import jwt from "jsonwebtoken";

export const create = (payload: Record<string, any>, secret: string) => {
  return jwt.sign(payload, secret);
};

export const verify = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
