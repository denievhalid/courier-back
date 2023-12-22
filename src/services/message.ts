import { getModel } from "@/lib/container";
import type { MessageType } from "@/types";
import { FilterQuery, PipelineStage, UpdateQuery } from "mongoose";
import { Services, UserType } from "@/types";

export const create = (payload: MessageType) => {
  return getModel(Services.MESSAGE).create(payload);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel(Services.MESSAGE).aggregate(pipeline);
};
export const find = (filter: FilterQuery<MessageType>) => {
  return getModel(Services.MESSAGE).find(filter);
};

export const findOne = (filter: FilterQuery<MessageType>) => {
  return getModel(Services.MESSAGE).findOne(filter);
};

export const update = (
  filter: FilterQuery<UserType>,
  update: UpdateQuery<UserType>,
  options = {}
) => {
  return getModel(Services.MESSAGE).findOneAndUpdate(filter, update, options);
};
