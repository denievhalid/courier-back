import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req.body, "user");

  const userService = getService("user");

  const userExists = await userService.exists({ _id: user });

  if (!userExists) {
    throw new Error("User not found");
  }

  const dialog = await getService("dialog").create({
    users: [user, getParam(req, "user")],
  });

  return getResponse(res, { data: dialog }, StatusCodes.CREATED);
});
