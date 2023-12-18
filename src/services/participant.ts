import { getModel } from "@/lib/container";
import { FilterQuery, PipelineStage, UpdateQuery } from "mongoose";
import { ParticipantType, Services } from "@/types";

export const create = (payload: ParticipantType) => {
  return getModel(Services.PARTICIPANT).create(payload);
};

export const update = (
  { _id }: FilterQuery<ParticipantType>,
  update: UpdateQuery<ParticipantType>
) => {
  return getModel(Services.PARTICIPANT).findOneAndUpdate(
    { _id },
    { ...update },
    { new: true }
  );
};

export const find = (filter: FilterQuery<ParticipantType>) => {
  return getModel(Services.PARTICIPANT).find(filter);
};

export const findOne = (filter: FilterQuery<ParticipantType>) => {
  return getModel(Services.PARTICIPANT).findOne(filter);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return getModel(Services.PARTICIPANT).aggregate(pipeline);
};
