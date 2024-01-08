import _ from "lodash";
import { SortType } from "@/controllers/ad/types";
import type { FilterQuery, PipelineStage } from "mongoose";
import * as mongoose from "mongoose";
import { isValidObjectId } from "@/utils/isValidObjectId";
import { toObjectId } from "@/utils/toObjectId";
import { AggregateBuilder } from "@/lib/builder";
import { DeliveryStatus } from "@/types";

const dateSet = new Set(["startDate", "endDate"]);

const MATCH_PARAM_SEPARATOR = ":";

export const getAttributes = (data: Record<string, any>) =>
  _.pick(data, [
    "startDate",
    "endDate",
    "from",
    "to",
    "sort",
    "page",
    "filterHash",
    "status",
    "user",
  ]);

export const getMatchPipeline = (match: Record<string, any>) => {
  const stage: PipelineStage.Match = {
    $match: {},
  };

  let date: { $gte?: Date; $lte?: Date } = {};

  if (_.isString(match)) {
    match = [match];
  }

  _.forEach(match, (item) => {
    let [param, value] = parseMatchParam(item);

    if (isValidObjectId(value)) {
      value = toObjectId(value);
    }

    if (dateSet.has(param)) {
      if (param === "startDate") {
        date["$gte"] = new Date(value);
      }

      if (param === "endDate") {
        date["$lte"] = new Date(value);
      }

      stage["$match"]["date"] = date;
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
      comment: 1,
      from: 1,
      to: 1,
      startDate: 1,
      endDate: 1,
      date: 1,
      status: 1,
      images: 1,
      title: 1,
      price: 1,
      weight: 1,
      routes: 1,
      delivery: { $first: "$delivery.status" },
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

export const getSkipPipeline = (skip: number): PipelineStage.Skip => {
  return {
    $skip: skip,
  };
};

export const getLookupPipeline = (): PipelineStage.Lookup[] => {
  return [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "deliveries",
        localField: "_id",
        foreignField: "ad",
        as: "delivery",
      },
    },
  ];
};

export const parseMatchParam = (param: string): any[] => {
  return _.split(decodeURIComponent(param), MATCH_PARAM_SEPARATOR);
};

export const getListAggregateBuilder = (queryParams: { [k: string]: any }) => {
  const aggregateBuilder = AggregateBuilder.init();

  if (queryParams.status) {
    if (!_.isArray(queryParams.status)) {
      queryParams.status = [queryParams.status];
    }
    aggregateBuilder.match({
      status: {
        $in: queryParams.status,
      },
    });
  }

  if (queryParams.user) {
    aggregateBuilder.match({
      user: toObjectId(queryParams.user),
    });
  }

  if (queryParams.from) {
    aggregateBuilder.match({
      from: queryParams.from,
    });
  }

  if (queryParams.to) {
    aggregateBuilder.match({
      to: queryParams.to,
    });
  }

  if (queryParams.endDate) {
    aggregateBuilder.match({
      $and: [
        {
          startDate: {
            $lte: new Date(queryParams.endDate),
          },
        },
        {
          endDate: {
            $gte: new Date(queryParams.startDate),
          },
        },
      ],
    });
  } else {
    aggregateBuilder.match({
      endDate: {
        $gte: new Date(),
      },
    });
  }

  if (queryParams.sort) {
    aggregateBuilder.sort({
      [queryParams.sort]: -1,
    });
  }

  aggregateBuilder
    .lookup([
      {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    ])
    .project({
      _id: 1,
      comment: 1,
      from: 1,
      to: 1,
      startDate: 1,
      endDate: 1,
      date: 1,
      status: 1,
      images: 1,
      title: 1,
      price: 1,
      weight: 1,
      routes: 1,
      cover: { $first: "$images" },
      user: { $first: "$user" },
    });

  return aggregateBuilder.build();
};
