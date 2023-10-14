import { getModel } from "@/lib/container";
import { UserType } from "@/types";
import { FilterQuery } from "mongoose";

export const register = () => {};

export const exists = (filter: FilterQuery<UserType>) => {
  return getModel("user").exists(filter);
};

export const create = (payload: UserType) => {
  return getModel("user").create(payload);
};

export const findOne = (query: FilterQuery<UserType>) => {
  return getModel("user").findOne(query);
};
