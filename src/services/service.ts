import type { PipelineStage } from "mongoose";
import { getModel } from "@/lib/container";

export const getList = (pipeline: PipelineStage[]) => {
  return getModel("favorite").aggregate(pipeline);
};
