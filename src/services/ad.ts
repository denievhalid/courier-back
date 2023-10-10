import { getModel } from "@/lib/container";
import type { PipelineStage } from "mongoose";

export const getList = (pipeline: PipelineStage[]) => {
  return getModel("ad").aggregate(pipeline);
};

export const getById = (_id: string) => {
  return getModel("ad").findOne({ _id });
};
