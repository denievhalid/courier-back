import AdModel from "@/models/ad";
import DialogModel from "@/models/dialog";
import FileModel from "@/models/file";
import OtpModel from "@/models/otp";
import UserModel from "@/models/user";
import * as AdService from "@/services/ad";
import * as FileService from "@/services/file";
import * as DialogService from "@/services/dialog";
import * as MessageService from "@/services/message";
import * as OtpService from "@/services/otp";
import * as UserService from "@/services/user";
import type { Model } from "mongoose";

const models = new Map<string, Model<any>>();
const services = new Map();

services.set("ad", AdService);
services.set("dialog", DialogService);
services.set("file", FileService);
services.set("message", MessageService);
services.set("otp", OtpService);
services.set("user", UserService);

models.set("ad", AdModel);
models.set("dialog", DialogModel);
models.set("file", FileModel);
models.set("otp", OtpModel);
models.set("user", UserModel);

export const getService = (name: string) => {
  return services.get(name);
};

export const getModel = (name: string): Model<any> => {
  return models.get(name) as Model<any>;
};
