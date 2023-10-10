import _ from "lodash";
import { SortType } from "@/controllers/ad/types";
import type { FilterQuery, PipelineStage } from "mongoose";
import { isValidObjectId } from "@/utils/isValidObjectId";

const MATCH_PARAM_SEPARATOR = ":";

export const getAttributes = (data: Record<string, any>) =>
  _.pick(data, ["match", "sort"]);

export const getMatchAggregatePipeline = (match: Record<string, any>) => {
  const stage: PipelineStage.Match = {
    $match: {},
  };

  if (_.isString(match)) {
    match = [match];
  }

  _.forEach(match, (item) => {
    const [param, value] = parseMatchParam(item);

    if (isValidObjectId(value)) {
      stage["$match"]["$expr"] = {
        $eq: [`$${param}`, { $toObjectId: value }],
      };
    } else {
      stage["$match"][param] = value;
    }
  });

  return stage;
};

export const getSortAggregatePipeline = (
  sort: SortType
): PipelineStage.Sort => {
  return {
    $sort: { [sort]: -1 },
  };
};

export const getLimitAggregatePipeline = (
  limit: number
): PipelineStage.Limit => {
  return {
    $limit: limit,
  };
};

export const getInitialAggregatePipeline = (limit: number): PipelineStage[] => {
  return [
    getLimitAggregatePipeline(limit),
    {
      $sort: {
        _id: 1,
      },
    },
  ];
};

export const parseMatchParam = (param: string): string[] => {
  return _.split(param, MATCH_PARAM_SEPARATOR);
};
