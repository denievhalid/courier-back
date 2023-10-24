import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import _ from "lodash";
import { getParam } from "@/utils/getParam";
import { UserType } from "@/types";
import { getService } from "@/lib/container";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req.body, "user") as UserType;

  const userService = getService("user");

  const userExists = await userService.exists({ _id: user._id });

  if (!userExists) {
    throw new Error("Пользователь не найден");
  }

  const dialog = await getService("dialog").create({
    users: [user._id],
  });

  return getResponse(res, { data: dialog }, StatusCodes.CREATED);
});

export const getConversationsList = asyncHandler(
  async (req: Request, res: Response) => {
    const conversationService = getService("conversation");

    const data = await conversationService.aggregate([
      {
        $limit: 20,
      },
    ]);

    return getResponse(res, { data }, StatusCodes.OK);
  }
);
