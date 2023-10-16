import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import type { Request, Response } from "express";
import { getParam } from "@/utils/getParam";
import { getUploadPayload } from "@/controllers/file/utils";

export const upload = asyncHandler(async (req: Request, res: Response) => {
  const files = getParam(req, "files") || [];

  console.log(getUploadPayload(files));

  return getResponse(res, { files: getUploadPayload(files) });
});
