import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import {
  getAddFieldsPipeline,
  getAttributes,
  getLimitPipeline,
  getLookupPipeline,
  getMatchPipeline,
  getProjectPipeline,
  getSkipPipeline,
  getSortPipeline,
} from "@/controllers/ad/utils";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { LIMIT } from "@/controllers/ad/const";
import mongoose, { PipelineStage } from "mongoose";
import { createAdSchema } from "@/controllers/ad/validation";
import { UserType } from "@/types";
import { StatusCodes } from "http-status-codes";
import dayjs from "dayjs";
import { toObjectId } from "@/utils/toObjectId";

export const create = asyncHandler(async (req: Request, res: Response) => {
  await createAdSchema.validate(req.body, { abortEarly: false });

  const user = getParam(req, "user") as UserType;

  const attributes = _.pick(req.body, [
    "title",
    "startDate",
    "endDate",
    "to",
    "price",
    "from",
    "images",
    "weight",
    "comment",
  ]);

  if (attributes.startDate) {
    attributes.startDate = dayjs(attributes.startDate).toDate();
  }

  if (attributes.endDate) {
    attributes.endDate = dayjs(attributes.endDate).toDate();
  }

  const data = await getService("ad").create({
    ...attributes,
    user: user._id,
  });

  return getResponse(res, { data });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const user = getParam(req, "user") as UserType;

  const attributes = _.pick(req.body, [
    "title",
    "date",
    "to",
    "price",
    "status",
    "from",
    "images",
    "weight",
    "comment",
  ]);

  await getService("ad").update(id, attributes);

  const pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        _id: toObjectId(id),
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
    {
      $addFields: {
        user: { $first: "$user" },
      },
    }
  );

  if (user) {
    pipeline.push({
      $lookup: {
        from: "favorites",
        foreignField: "ad",
        localField: "_id",
        as: "favorites",
      },
    });

    pipeline.push({
      $addFields: {
        isFavorite: { $toBool: { $size: "$favorites" } },
        isOwn: {
          $cond: [{ $eq: ["$user._id", user._id] }, true, false],
        },
      },
    });
  }

  const data = await getService("ad").aggregate(pipeline);

  return getResponse(res, { data: _.first(data) });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const user = getParam(req, "user") as UserType;

  const pipeline: PipelineStage[] = [];

  let delivery = null;

  pipeline.push(
    {
      $match: {
        _id: toObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "deliveries",
              localField: "user",
              foreignField: "user",
              as: "deliveries",
            },
          },
        ],
        as: "user",
      },
    },
    {
      $addFields: {
        user: { $first: "$user" },
        cover: { $first: "$images" },
      },
    }
  );

  if (user) {
    pipeline.push({
      $lookup: {
        from: "favorites",
        foreignField: "ad",
        localField: "_id",
        as: "favorites",
      },
    });

    pipeline.push({
      $addFields: {
        isFavorite: { $toBool: { $size: "$favorites" } },
        isOwn: {
          $cond: [{ $eq: ["$user._id", user._id] }, true, false],
        },
      },
    });

    delivery = (
      await getService("delivery").findOne({
        ad: toObjectId(id),
        user: toObjectId(user._id),
      })
    )?.status;
  }

  const data = _.first(await getService("ad").aggregate(pipeline));

  if (_.isObject(data)) {
    _.set(data, "delivery", delivery || null);
  }

  return getResponse(res, { data });
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const attributes = getAttributes(req.query);

  const user = getParam(req, "user") as UserType;

  const directionService = getService("direction");

  const page = attributes.page || 1;

  const query: PipelineStage[] = [];

  if (_.has(attributes, "match")) {
    query.push(getMatchPipeline(attributes.match));
  }

  if (_.has(attributes, "sort")) {
    query.push(getSortPipeline(attributes.sort));
  }

  query.push(getSkipPipeline((page - 1) * LIMIT));
  query.push(getLimitPipeline(LIMIT));
  query.push(...getLookupPipeline());
  query.push(getProjectPipeline());
  query.push(getAddFieldsPipeline());

  const data = await getService("ad").getList(query);

  let isFavoriteDirection = false;

  if (user) {
    isFavoriteDirection = await directionService.count({
      hash: attributes.filterHash,
    });
  }

  const payload = _.assign(data, { isFavoriteDirection });

  return getResponse(res, { data: payload }, StatusCodes.OK);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await getService("ad").remove(getParam(req.params, "id"));

  return getResponse(res, {}, StatusCodes.NO_CONTENT);
});
