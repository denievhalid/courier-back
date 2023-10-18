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
        phoneNumber: verified.phoneNumber,
      },
    },
    {
      $lookup: {
        from: "deliveries",
        localField: "_id",
        foreignField: "user",
        as: "deliveries",
      },
    },
    {
      $group: {
        _id: "$deliveries",
        numOfStudent: { $sum: 1 },
        listOfStudents: { $push: "$name" },
      },
    },
  ]);

  if (!user) {
    throw new InvalidCredentialsException();
  }

  _.set(req, "user", user);

  next();
});
