import { getModel } from "@/lib/container";
import type { PipelineStage } from "mongoose";
import type { AdType } from "@/types";

export const create = (payload: AdType) => {
  return getModel("ad").create(payload);
};

export const getList = (pipeline: PipelineStage[]) => {
  return getModel("ad").aggregate(pipeline);

  //return getModel("ad").aggregate([{}]);
};

export const getById = (_id: string) => {
  return getModel("ad").findOne({ _id });
};
