import { getModel } from "@/lib/container";
import { BlockType } from "@/types";
import { FilterQuery, PipelineStage } from "mongoose";

export const create = (payload: BlockType) => {
  return getModel("block").create(payload);
};

export const findOne = (filter: FilterQuery<BlockType>) => {
  return getModel("block").findOne(filter);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("block").aggregate(pipeline);
};

export const remove = (filter: FilterQuery<BlockType>) => {
  return getModel("block").findOneAndRemove(filter);
};
