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

  const phoneNumber = getParam(req.body, "phoneNumber", "number");

  const otpService = getService("otp");
  const userService = getService("user");

  const userExists = await userService.exists({
    phoneNumber,
  });

  if (!userExists) {
    const user = await userService.create({ phoneNumber });

    let otpDoc = await otpService.findOne({
      user: user._id,
      deadline: {
        $gt: dayjs().toDate(),
      },
    });
  }

  // if (!otpDoc) {
  //   otpDoc = await otpService.create({
  //     ...otpService.generateOtp(),
  //     deadline: otpService.getDeadline(),
  //     user,
  //   });
  // }

  //const payload = otpService.getOtpPayload(otpDoc);

  return getResponse(res, {}, StatusCodes.OK);
});

export const validateOtp = asyncHandler(async (req: Request, res: Response) => {
  await validateOtpSchema.validate(req.body);
});
