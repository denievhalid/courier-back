import {
  ClientSession,
  FilterQuery,
  PipelineStage,
  UpdateQuery,
} from "mongoose";
import { getModel } from "@/lib/container";
import { DeliveryType } from "@/types";

export const count = (pipeline: PipelineStage[]) => {
  return getModel("delivery").countDocuments(pipeline);
};

export const create = (pipeline: PipelineStage[]) => {
  return getModel("delivery").create(pipeline);
};

export const findOne = (
  filter: FilterQuery<DeliveryType>,
  session?: { session: ClientSession }
) => {
  return getModel("delivery").findOne(filter, null, session ?? {});
};

export const update = (
  filter: FilterQuery<DeliveryType>,
  update: UpdateQuery<DeliveryType>
) => {
  return getModel("delivery").findOneAndUpdate(filter, update);
};

export const remove = (
  filter: FilterQuery<DeliveryType>,
  session?: { session: ClientSession }
) => {
  return getModel("delivery").findOneAndRemove(filter, session ?? {});
};
