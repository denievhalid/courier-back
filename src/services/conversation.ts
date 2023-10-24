import { getModel } from "@/lib/container";
import { PipelineStage } from "mongoose";

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("conversation").aggregate(pipeline);
};
