import AdModel from "@/models/ad";
import OtpModel from "@/models/otp";
import UserModel from "@/models/user";
import * as AdService from "@/services/ad";
import * as OtpService from "@/services/otp";
import * as UserService from "@/services/user";
import type { Model } from "mongoose";

const models = new Map<string, Model<any>>();
const services = new Map();

services.set("ad", AdService);
services.set("otp", OtpService);
services.set("user", UserService);

models.set("ad", AdModel);
models.set("otp", OtpModel);
models.set("user", UserModel);

export const getService = (name: string) => {
  return services.get(name);
};

export const getModel = (name: string): Model<any> => {
  return models.get(name) as Model<any>;
};
