import AdModel from "@/models/ad";
import ConversationModel from "@/models/conversation";
import DialogModel from "@/models/dialog";
import DeliveryModel from "@/models/delivery";
import FavoriteModel from "@/models/favorite";
import MessageModel from "@/models/message";
import FileModel from "@/models/file";
import OtpModel from "@/models/otp";
import UserModel from "@/models/user";
import * as AdService from "@/services/ad";
import * as ConversationService from "@/services/conversation";
import * as FavoriteService from "@/services/favorite";
import * as FileService from "@/services/file";
import * as DialogService from "@/services/dialog";
import * as DeliveryService from "@/services/delivery";
import * as MessageService from "@/services/message";
import * as OtpService from "@/services/otp";
import * as TokenService from "@/services/token";
import * as UserService from "@/services/user";
import type { Model } from "mongoose";

let container: { services: any; models: any } | null = null;

export const createContainer = () => {
  if (container) return container;

  container = {
    models: new Map<string, Model<any>>(),
    services: new Map(),
  };

  container.services.set("ad", AdService);
  container.services.set("conversation", ConversationService);
  container.services.set("dialog", DialogService);
  container.services.set("delivery", DeliveryService);
  container.services.set("favorite", FavoriteService);
  container.services.set("file", FileService);
  container.services.set("message", MessageService);
  container.services.set("otp", OtpService);
  container.services.set("token", TokenService);
  container.services.set("user", UserService);

  container.models.set("ad", AdModel);
  container.models.set("conversation", ConversationModel);
  container.models.set("delivery", DeliveryModel);
  container.models.set("dialog", DialogModel);
  container.models.set("favorite", FavoriteModel);
  container.models.set("message", MessageModel);
  container.models.set("file", FileModel);
  container.models.set("otp", OtpModel);
  container.models.set("user", UserModel);

  return container;
};

export const getService = (name: string) => {
  return createContainer().services.get(name);
};

export const getModel = (name: string): Model<any> => {
  return createContainer().models.get(name) as Model<any>;
};
