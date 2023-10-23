import { getModel } from "@/lib/container";
import type { MessageType } from "@/types";
import { FilterQuery, PipelineStage } from "mongoose";

export const create = (payload: MessageType) => {
  return getModel("message").create(payload);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("message").aggregate(pipeline);
};
export const find = (filter: FilterQuery<MessageType>) => {
  return getModel("message").find(filter);
};

export const findOne = (filter: FilterQuery<MessageType>) => {
  return getModel("message").findOne(filter);
};
