import AdModel from "@/models/ad";
import * as AdService from "@/services/ad";
import * as UserService from "@/services/user";

const models = new Map();
const services = new Map();

services.set("ad", AdService);
services.set("user", UserService);

models.set("ad", AdModel);

export const getService = (name: string) => {
  return services.get(name);
};

export const getModel = (name: string) => {
  return models.get(name);
};
