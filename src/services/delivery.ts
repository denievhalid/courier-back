import { PipelineStage } from "mongoose";
import { getModel } from "@/lib/container";

export const count = (pipeline: PipelineStage[]) => {
  return getModel("delivery").countDocuments(pipeline);
};
