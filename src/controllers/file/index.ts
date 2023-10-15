import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import type { Request, Response } from "express";
import { getParam } from "@/utils/getParam";

export const upload = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(res, { files: getParam(req, "files") ?? [] });
});
