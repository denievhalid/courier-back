import { getModel } from "@/lib/container";
import type { DialogType } from "@/types";
import type { FilterQuery, PipelineStage } from "mongoose";

export const count = (filter: FilterQuery<DialogType>) => {
  return getModel("dialog").countDocuments(filter);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("dialog").aggregate(pipeline);
};

export const create = (payload: DialogType) => {
  return getModel("dialog").create(payload);
};

export const findOne = (filter: FilterQuery<DialogType>) => {
  return getModel("dialog").findOne(filter);
};

export const getList = (pipeline: PipelineStage[]) => {
  return getModel("dialog").aggregate(pipeline);
};
