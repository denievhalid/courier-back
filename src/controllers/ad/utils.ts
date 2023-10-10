import _ from "lodash";
import { SortType } from "@/controllers/ad/types";
import type { FilterQuery, PipelineStage } from "mongoose";

export const getAttributes = (data: Record<string, any>) =>
  _.pick(data, ["sort", "user"]);

export const getMatchAggregatePipeline = (items: Record<string, any>) => {
  const stage: PipelineStage.Match = {
    $match: {},
  };

  _.forIn(items, (item) => {
    stage["$match"][item] = items[item];
  });

  return stage;
};

export const getSortAggregatePipeline = (
  sort: SortType
): PipelineStage.Sort => {
  return {
    $sort: { [sort]: 1 },
  };
};

export const getLimitAggregatePipeline = (
  limit: number
): PipelineStage.Limit => {
  return {
    $limit: limit,
  };
};
