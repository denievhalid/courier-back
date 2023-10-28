import type { FilterQuery, PipelineStage } from "mongoose";
import { getModel } from "@/lib/container";
import { FavoriteType } from "@/types";

export const create = (payload: FavoriteType) => {
  return getModel("favorite").create(payload);
};

export const remove = (filter: FilterQuery<FavoriteType>) => {
  return getModel("favorite").findOneAndRemove(filter);
};

export const getList = (pipeline: PipelineStage[]) => {
  return getModel("favorite").aggregate(pipeline);
};

export const exists = (filter: FilterQuery<FavoriteType>) => {
  return getModel("favorite").countDocuments(filter);
};
