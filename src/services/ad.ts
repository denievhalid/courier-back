import { getModel } from "@/lib/container";
import type { PipelineStage } from "mongoose";
import type { AdType } from "@/types";

export const create = (payload: AdType) => {
  return getModel("ad").create(payload);
};

export const getList = (pipeline: PipelineStage[]) => {
  return getModel("ad").aggregate(pipeline);
};

export const getById = (_id: string) => {
  return getModel("ad").findOne({ _id }).populate("user");
};

export const remove = (id: string) => {
  return getModel("ad").findByIdAndRemove(id);
};
