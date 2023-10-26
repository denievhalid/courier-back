import { getModel } from "@/lib/container";
import type { FilterQuery, PipelineStage } from "mongoose";
import type { DirectionType } from "@/types";

export const create = (payload: DirectionType) => {
  return getModel("direction").create(payload);
};

export const getList = (filter: FilterQuery<DirectionType>) => {
  return getModel("direction").find(filter);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("direction").aggregate(pipeline);
};
