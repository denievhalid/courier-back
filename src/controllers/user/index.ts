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
import { getUserAggregate } from "@/utils/aggregate";
import { toObjectId } from "@/utils/toObjectId";

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

  const attributes = getAttributes(req.body, [
    "avatar",
    "gender",
    "firstname",
    "city",
    "phoneNumber",
  ]);

  const userService = getService("user");

  const payload = {
    phoneNumber: attributes.phoneNumber,
  };

  const userExists = await userService.exists(payload);

  console.log(111);

  if (userExists) {
    throw new Error("Пользователь уже существует");
  }

  console.log(222);

  const tokenService = getService("token");

  await userService.create(attributes);

  const user = await getUserAggregate(attributes.phoneNumber);

  const accessToken = tokenService.create(
    { phoneNumber: attributes.phoneNumber },
    getEnv("JWT_SECRET")
  );

  console.log(333);

  console.log({
    accessToken,
    user: _.assign(sanitizeUser(_.first(user) as UserType), {
      deliveries: 0,
    }),
  });

  return getResponse(
    res,
    {
      accessToken,
      user: _.assign(sanitizeUser(_.first(user) as UserType), {
        deliveries: 0,
      }),
    },
    StatusCodes.CREATED
  );
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const user = getParam(req, "user") as UserType;

  const blockService = getService("block");
  const userService = getService("user");

  const isBlocked = Boolean(
    await blockService.count({
      user: toObjectId(user._id),
      blockedUser: toObjectId(id),
    })
  );

  const data = await userService.aggregate([
    {
      $match: {
        _id: toObjectId(id),
      },
    },
    {
      $lookup: {
        from: "delivery",
        localField: "_id",
        foreignField: "user",
        as: "deliveries",
      },
    },
    {
      $addFields: {
        isBlocked,
        deliveries: { $size: "$deliveries" },
      },
    },
  ]);

  return getResponse(res, { data: _.first(data) }, StatusCodes.OK);
});

export const updateAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const avatar = getParam(req, "file");
    const user = getParam(req, "user") as UserType;

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

export const removeAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getParam(req, "user") as UserType;

    const userService = getService("user");

    await userService.update(
      {
        phoneNumber: user?.phoneNumber,
      },
      {
        avatar: {
          uri: null,
        },
      }
    );

    return getResponse(res, {}, StatusCodes.NO_CONTENT);
  }
);

export const update = asyncHandler(async (req: Request, res: Response) => {
  const updatePayload = getParam(req.body, "payload");
  const user = getParam(req, "user") as UserType;

  const userService = getService("user");

  await userService.update(
    {
      phoneNumber: user?.phoneNumber,
    },
    {
      ...updatePayload,
    }
  );

  return getResponse(res, {}, StatusCodes.OK);
});
