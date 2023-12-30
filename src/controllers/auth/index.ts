import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { sendOtpSchema, verifyOtpSchema } from "@/controllers/auth/validation";
import { getService } from "@/lib/container";
import { getAttributes } from "@/utils/getAttributes";
import { Services } from "@/types";

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  await verifyOtpSchema.validate(req.body);

  const attributes = getAttributes(req.body, ["phoneNumber", "otp"]);

  const otpService = getService(Services.OTP);
  const tokenService = getService(Services.TOKEN);
  const userService = getService(Services.USER);

  let otpDoc = await otpService.findOne({
    phoneNumber: attributes.phoneNumber,
    deadline: {
      $gt: new Date(),
    },
  });

  if (!otpDoc) {
    throw new Error("Неверный код");
  }
  //
  // const verified = otpService.verify(attributes.otp, otpDoc.secret);
  //
  // if (!verified) {
  //   throw new Error("Неверный код");
  // }
  //
  // const credentials = {
  //   phoneNumber: attributes.phoneNumber,
  // };

  // await otpService.remove({
  //   otp: attributes.otp,
  //   ...credentials,
  // });

  // const user = await userService.findOne(credentials);
  //
  // let payload = {
  //   user,
  // };
  //
  // if (user) {
  //   _.set(
  //     payload,
  //     "accessToken",
  //     tokenService.create(credentials, getEnv("JWT_SECRET"))
  //   );
  // }
  //
  // return getResponse(res, payload, StatusCodes.OK);
});

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  await sendOtpSchema.validate(req.body, { abortEarly: false });

  const attributes = getAttributes(req.body, ["phoneNumber"]);
  const otpService = getService(Services.OTP);

  let otpDoc = await otpService.findOne({
    phoneNumber: attributes.phoneNumber,
    deadline: {
      $gt: new Date(),
    },
  });

  if (!otpDoc) {
    // otpDoc = await otpService.create({
    //   ...otpService.generateOtp(),
    //   deadline: otpService.getDeadline(),
    //   phoneNumber: attributes.phoneNumber,
    // });
  }

  //return getResponse(res, otpService.getOtpPayload(otpDoc), StatusCodes.OK);
});
