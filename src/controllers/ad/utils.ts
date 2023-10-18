import _ from "lodash";
import { SortType } from "@/controllers/ad/types";
import type { FilterQuery, PipelineStage } from "mongoose";
import { isValidObjectId } from "@/utils/isValidObjectId";

const MATCH_PARAM_SEPARATOR = ":";

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
    console.log(value);
    if (isValidObjectId(value)) {
      console.log(value);
      stage["$match"]["$expr"] = {
        $eq: [`$${param}`, { $toObjectId: value }],
      };
    } else {
      stage["$match"][param] = value;
    }
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
      from: 1,
      to: 1,
      date: 1,
      status: 1,
      images: 1,
      title: 1,
      price: 1,
      weight: 1,
      routes: 1,
      user: { $first: "$user" },
    },
  };
};

export const getAddFieldsPipeline = (): PipelineStage.AddFields => {
  return {
    $addFields: {
      cover: { $first: "$images" },
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
  return _.split(decodeURIComponent(param), MATCH_PARAM_SEPARATOR);
};
