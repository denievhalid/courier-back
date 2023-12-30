import { BaseService } from "@/services/base";
import { getModel } from "@/lib/container";
import { Models } from "@/types";

import jwt from "jsonwebtoken";

export class TokenService {
  sign(payload: Record<string, any>, secret: string) {
    return jwt.sign(payload, secret);
  }

  verify(token: string, secret: string) {
    return jwt.verify(token, secret);
  }
}
