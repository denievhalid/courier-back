import {
  AdModel,
  BlockModel,
  ConversationModel,
  DeliveryModel,
  DirectionModel,
  FavoriteModel,
  FileModel,
  MessageModel,
  OtpModel,
  UserModel,
} from "@/models";

import { BaseService } from "@/services/base";
import { Models, Services } from "@/types";
import {
  AdService,
  BlockService,
  ConversationService,
  DeliveryService,
  DirectionService,
  FavoriteService,
  FileService,
  MessageService,
  OtpService,
  TokenService,
  UserService,
} from "@/services";
import type { Model } from "mongoose";

interface Container {
  services: Map<Services, any>;
  models: Map<Models, any>;
}

let container: Container | null = null;

export const createContainer = () => {
  if (container) return container;

  container = {
    models: new Map(),
    services: new Map(),
  };

  registerModels(container);
  registerServices(container);

  return container;
};

function registerServices(container: Container) {
  container.services.set(Services.AD, new AdService());
  container.services.set(Services.BLOCK, new BlockService());
  container.services.set(Services.CONVERSATION, new ConversationService());
  container.services.set(Services.DELIVERY, new DeliveryService());
  container.services.set(Services.DIRECTION, new DirectionService());
  container.services.set(Services.FAVORITE, new FavoriteService());
  container.services.set(Services.FILE, new FileService());
  container.services.set(Services.MESSAGE, new MessageService());
  container.services.set(Services.OTP, OtpService);
  container.services.set(Services.TOKEN, new TokenService());
  container.services.set(Services.USER, new UserService());
}

function registerModels(container: Container) {
  container.models.set(Models.AD, AdModel);
  container.models.set(Models.BLOCK, BlockModel);
  container.models.set(Models.CONVERSATION, ConversationModel);
  container.models.set(Models.DELIVERY, DeliveryModel);
  container.models.set(Models.DIRECTION, DirectionModel);
  container.models.set(Models.FAVORITE, FavoriteModel);
  container.models.set(Models.MESSAGE, MessageModel);
  container.models.set(Models.FILE, FileModel);
  container.models.set(Models.OTP, OtpModel);
  container.models.set(Models.USER, UserModel);
}

export const getService = <T extends BaseService>(name: Services): T => {
  return createContainer().services.get(name);
};

export const getModel = (name: Models): Model<unknown> => {
  return createContainer().models.get(name);
};
