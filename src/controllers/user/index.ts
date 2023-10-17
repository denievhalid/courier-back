import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { createUserValidation } from "@/controllers/user/validation";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getService } from "@/lib/container";
import { getAttributes } from "@/utils/getAttributes";
import { getParam } from "@/utils/getParam";

export const me = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(
    res,
    {
      user: getParam(req, "user"),
    },
    StatusCodes.OK
  );
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  await createUserValidation.validate(req.body);

  const attributes = getAttributes(req.body, ["phoneNumber"]);

  const useService = getService("user");

  const payload = {
    phoneNumber: attributes.phoneNumber,
  };

  const userExists = await useService.exists(payload);

  if (userExists) {
    throw new Error("User exists");
  }

  await useService.create(attributes);

  return getResponse(res, {}, StatusCodes.CREATED);
});
