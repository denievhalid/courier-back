import _ from "lodash";
import { SortType } from "@/controllers/ad/types";
import type { FilterQuery, PipelineStage } from "mongoose";
import { isValidObjectId } from "@/utils/isValidObjectId";

const MATCH_PARAM_SEPARATOR = ":";

const routeTypes = new Set(["from", "to"]);

export const getAttributes = (data: Record<string, any>) =>
  _.pick(data, ["match", "sort"]);

export const getMatchPipeline = (match: Record<string, any>) => {
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
    }

    if (routeTypes.has(param)) {
    }

    //stage["$match"][param] = value;
  });

  return stage;
};

export const getSortPipeline = (sort: SortType): PipelineStage.Sort => {
  return {
    $sort: { [sort]: -1 },
  };
};

export const getProjectPipeline = (): PipelineStage.Project => {
  return {
    $project: {
      _id: 1,
      cover: 1,
      comment: 1,
      date: 1,
      images: 1,
      title: 1,
      price: 1,
      weight: 1,
      routes: 1,
      from: { $first: "$from" },
      to: { $first: "$to" },
      user: { $first: "$user" },
    },
  };
};

export const getLimitPipeline = (limit: number): PipelineStage.Limit => {
  return {
    $limit: limit,
  };
};

export const getInitialPipeline = (limit: number): PipelineStage[] => {
  return [
    getLimitPipeline(limit),
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
  ];
};

export const parseMatchParam = (param: string): string[] => {
  return _.split(param, MATCH_PARAM_SEPARATOR);
};
