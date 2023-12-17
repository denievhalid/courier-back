import { getModel } from "@/lib/container";
import { FilterQuery, PipelineStage, UpdateQuery } from "mongoose";
import { AdType, ConversationType, Services } from "@/types";

export const create = (payload: ConversationType) => {
  return getModel("conversation").create(payload);
};

export const update = (
  { _id }: FilterQuery<AdType>,
  update: UpdateQuery<AdType>
) => {
  return getModel(Services.CONVERSATION).findOneAndUpdate(
    { _id },
    { ...update },
    { new: true }
  );
};

export const find = (filter: FilterQuery<ConversationType>) => {
  return getModel("conversation").find(filter);
};

export const findOne = (filter: FilterQuery<ConversationType>) => {
  return getModel("conversation").findOne(filter);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("conversation").aggregate(pipeline);
};
