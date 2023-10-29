import { getModel } from "@/lib/container";
import type { FilterQuery, PipelineStage, UpdateQuery } from "mongoose";
import type { AdType } from "@/types";
import { DeliveryType } from "@/types";

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel("ad").aggregate(pipeline);
};

export const create = (payload: AdType) => {
  return getModel("ad").create(payload);
};

export const findOne = (filter: FilterQuery<DeliveryType>) => {
  return getModel("ad").findOne(filter);
};

export const update = (
  _id: FilterQuery<AdType>,
  update: UpdateQuery<AdType>
) => {
  return getModel("ad").findOneAndUpdate({ _id }, { ...update }, { new: true });
};

export const getList = (pipeline: PipelineStage[]) => {
  return getModel("ad").aggregate(pipeline);
};

export const getById = (_id: string) => {
  return getModel("ad").findOne({ _id }).populate("user");
};

export const remove = (id: string) => {
  return getModel("ad").findByIdAndRemove(id);
};
