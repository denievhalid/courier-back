import { getModel } from "@/lib/container";
import { UserType } from "@/types";
import { FilterQuery, PipelineStage } from "mongoose";

export const exists = (filter: FilterQuery<UserType>) => {
  return getModel("user").exists(filter);
};

export const create = (payload: UserType) => {
  return getModel("user").create(payload);
};

export const aggregate = (payload: PipelineStage[]) => {
  return getModel("user").aggregate(payload);
};

export const findOne = (query: FilterQuery<UserType>) => {
  return getModel("user").findOne(query);
};
