import { getModel } from "@/lib/container";
import type { MessageType } from "@/types";
import { PipelineStage } from "mongoose";

export const create = (payload: MessageType) => {
  return getModel("message").create(payload);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("message").aggregate(pipeline);
};
