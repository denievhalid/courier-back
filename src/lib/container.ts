import AdModel from "@/models/ad";
import BlockModel from "@/models/block";
import ConversationModel from "@/models/conversation";
import DeliveryModel from "@/models/delivery";
import DirectionModel from "@/models/direction";
import FavoriteModel from "@/models/favorite";
import MessageModel from "@/models/message";
import FileModel from "@/models/file";
import OtpModel from "@/models/otp";
import UserModel from "@/models/user";
import * as AdService from "@/services/ad";
import * as BlockService from "@/services/block";
import * as ConversationService from "@/services/conversation";
import * as FavoriteService from "@/services/favorite";
import * as FileService from "@/services/file";
import * as DeliveryService from "@/services/delivery";
import * as DirectionService from "@/services/direction";
import * as MessageService from "@/services/message";
import * as OtpService from "@/services/otp";
import * as TokenService from "@/services/token";
import * as UserService from "@/services/user";
import type { Model } from "mongoose";
import { BaseService } from "@/services/base";

interface Container {
  services: any;
  models: any;
}

let container: Container | null = null;

function registerServices(container: Container) {
  container.services.set("ad", AdService);
  container.services.set("block", BlockService);
  container.services.set("conversation", ConversationService);
  container.services.set("delivery", DeliveryService);
  container.services.set("direction", DirectionService);
  container.services.set("message", MessageService);
  container.services.set("favorite", FavoriteService);
  container.services.set("file", FileService);
  container.services.set("message", MessageService);
  container.services.set("otp", OtpService);
  container.services.set("token", TokenService);
  container.services.set("user", UserService);
}

function registerModels(container: Container) {
  container.models.set("ad", AdModel);
  container.models.set("block", BlockModel);
  container.models.set("conversation", ConversationModel);
  container.models.set("delivery", DeliveryModel);
  container.models.set("direction", DirectionModel);
  container.models.set("favorite", FavoriteModel);
  container.models.set("message", MessageModel);
  container.models.set("file", FileModel);
  container.models.set("otp", OtpModel);
  container.models.set("user", UserModel);
}

export const createContainer = () => {
  if (container) return container;

  container = {
    models: new Map<string, Model<any>>(),
    services: new Map(),
  };

  registerServices(container);
  registerModels(container);

  return container;
};

export const getService = (name: string): BaseService => {
  return new (createContainer().services.get(name))();
};

export const getModel = (name: string): Model<any> => {
  return createContainer().models.get(name) as Model<any>;
};
