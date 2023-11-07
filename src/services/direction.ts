import { getModel } from "@/lib/container";
import type { FilterQuery, PipelineStage } from "mongoose";
import type { DirectionType } from "@/types";
import { FavoriteType } from "@/types";

export const create = (payload: DirectionType) => {
  return getModel("direction").create(payload);
};

export const count = (payload: DirectionType) => {
  return getModel("direction").countDocuments(payload);
};

export const remove = (filter: FilterQuery<DirectionType>) => {
  return getModel("direction").findOneAndRemove(filter);
};

export const findOne = (filter: FilterQuery<DirectionType>) => {
  return getModel("direction").findOne(filter);
};

export const getList = (filter: FilterQuery<DirectionType>) => {
  return getModel("direction").find(filter);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("direction").aggregate(pipeline);
};
