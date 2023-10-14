import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import {
  sendOtpSchema,
  validateOtpSchema,
} from "@/controllers/auth/validation";
import { getService } from "@/lib/container";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getAttributes } from "@/utils/getAttributes";

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  await sendOtpSchema.validate(req.body, { abortEarly: false });

  const attributes = getAttributes(req.body, ["phoneNumber", "otp"]);
  const otpService = getService("otp");

  let otpDoc = await otpService.findOne({
    phoneNumber: attributes.phoneNumber,
    deadline: {
      $gt: new Date(),
    },
  });

  if (!otpDoc) {
    otpDoc = await otpService.create({
      ...otpService.generateOtp(),
      deadline: otpService.getDeadline(),
      phoneNumber: attributes.phoneNumber,
    });
  }

  return getResponse(res, otpService.getOtpPayload(otpDoc), StatusCodes.OK);
});

export const validateOtp = asyncHandler(async (req: Request, res: Response) => {
  await validateOtpSchema.validate(req.body);
});
