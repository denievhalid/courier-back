import { FilterQuery, PipelineStage, UpdateQuery } from "mongoose";
import { getModel } from "@/lib/container";
import { DeliveryType } from "@/types";

export const count = (pipeline: PipelineStage[]) => {
  return getModel("delivery").countDocuments(pipeline);
};

export const create = (pipeline: PipelineStage[]) => {
  return getModel("delivery").create(pipeline);
};

export const findOne = (filter: FilterQuery<DeliveryType>) => {
  return getModel("delivery").findOne(filter);
};

export const update = (id: string, update: UpdateQuery<DeliveryType>) => {
  return getModel("delivery").findByIdAndUpdate(id, update);
};
