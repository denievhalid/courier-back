import { getModel } from "@/lib/container";
import { FilterQuery, PipelineStage } from "mongoose";
import { ConversationType } from "@/types";

export const create = (payload: ConversationType) => {
  return getModel("conversation").create(payload);
};

export const findOne = (filter: FilterQuery<ConversationType>) => {
  return getModel("conversation").findOne(filter);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("conversation").aggregate(pipeline);
};
