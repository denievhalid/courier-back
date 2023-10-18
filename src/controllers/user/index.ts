import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { createUserValidation } from "@/controllers/user/validation";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getService } from "@/lib/container";
import { getAttributes } from "@/utils/getAttributes";
import { getParam } from "@/utils/getParam";
import { getEnv } from "@/utils/env";
import _ from "lodash";
import { sanitizeUser } from "@/controllers/user/utils";
import { UserType } from "@/types";
import { getFilename } from "@/controllers/file/utils";

export const me = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(
    res,
    {
      user: _.first(getParam(req, "user")),
    },
    StatusCodes.OK
  );
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  await createUserValidation.validate(req.body);

  const attributes = getAttributes(req.body, [
    "gender",
    "firstname",
    "phoneNumber",
  ]);

  const useService = getService("user");

  const payload = {
    phoneNumber: attributes.phoneNumber,
  };

  const userExists = await useService.exists(payload);

  if (userExists) {
    throw new Error("Пользователь уже существует");
  }

  const tokenService = getService("token");

  const user = await useService.create(attributes);

  const accessToken = tokenService.create(
    { phoneNumber: attributes.phoneNumber },
    getEnv("JWT_SECRET")
  );

  return getResponse(
    res,
    { accessToken, user: _.assign(sanitizeUser(user), { deliveries: 0 }) },
    StatusCodes.CREATED
  );
});

export const updateAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const avatar = getParam(req, "file");
    const user = _.first(getParam(req, "user")) as UserType;

    const userService = getService("user");

    await userService.update(
      {
        phoneNumber: user?.phoneNumber,
      },
      {
        avatar: {
          uri: getFilename(avatar.path),
        },
      }
    );

    return getResponse(res, {}, StatusCodes.OK);
  }
);
