import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import {
  sendOtpSchema,
  validateOtpSchema,
} from "@/controllers/auth/validation";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import dayjs from "dayjs";

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  await sendOtpSchema.validate(req.body, { abortEarly: false });

  const otpService = getService("otp");
  const userService = getService("user");

  let user = await userService.findOne({
    phoneNumber: getParam(req.body, "phoneNumber"),
  });

  if (!user) {
    await userService.create({ phoneNumber: user.phoneNumber });
  }

  let otpDoc = await otpService.findOne({
    user: user._id,
    deadline: {
      $gt: dayjs().toDate(),
    },
  });

  if (!otpDoc) {
    otpDoc = await otpService.create({
      ...otpService.generateOtp(),
      deadline: otpService.getDeadline(),
      user,
    });
  }

  const payload = otpService.getOtpPayload(otpDoc);

  return getResponse(res, payload, StatusCodes.OK);
});

export const validateOtp = asyncHandler(async (req: Request, res: Response) => {
  await validateOtpSchema.validate(req.body);
});
