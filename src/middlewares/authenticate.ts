import { getParam } from "@/utils/getParam";
import { asyncHandler } from "@/utils/asyncHandler";
import { InvalidCredentialsException } from "@/exceptions/forbidden";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getEnv } from "@/utils/env";

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = getParam(req, "token");

  if (!token) {
    throw new InvalidCredentialsException();
  }

  const tokenService = getService("token");
  const userService = getService("user");

  const verified = tokenService.verify(token, getEnv("JWT_SECRET")) as {
    phoneNumber: string;
  };

  if (!verified) {
    throw new InvalidCredentialsException();
  }

  const user = await userService.aggregate([
    {
      $match: {
        active: true,
        phoneNumber: Number(verified.phoneNumber),
      },
    },
    {
      $lookup: {
        from: "conversations",
        localField: "_id",
        foreignField: "receiver",
        as: "inboxConversations",
      },
    },
    {
      $lookup: {
        from: "conversations",
        localField: "_id",
        foreignField: "sender",
        as: "sentConversations",
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
      $project: {
        firstname: 1,
        avatar: 1,
        gender: 1,
        phoneNumber: 1,
        city: 1,
        deliveries: { $size: "$deliveries" },
        inboxConversations: { $size: "$inboxConversations" },
        sentConversations: { $size: "$sentConversations" },
      },
    },
  ]);

  if (_.isEmpty(user)) {
    throw new InvalidCredentialsException();
  }

  _.set(req, "user", _.first(user));

  next();
});
