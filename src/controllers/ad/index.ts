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
import _, { at } from "lodash";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { LIMIT } from "@/controllers/ad/const";
import mongoose, { PipelineStage } from "mongoose";
import { createAdSchema } from "@/controllers/ad/validation";
import { Services, UserType } from "@/types";
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
    attributes.startDate = new Date(attributes.startDate);
  }

  if (attributes.endDate) {
    attributes.endDate = new Date(attributes.endDate);
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
    "courier",
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
          {
            $addFields: {
              deliveries: { $size: "$deliveries" },
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
    const isFavorite = await getService("favorite").count({
      ad: toObjectId(id),
      user: toObjectId(user._id),
    });

    pipeline.push({
      $addFields: {
        isFavorite: Boolean(isFavorite),
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

  const directionService = getService(Services.DIRECTION);

  const page = attributes.page || 1;

  const query: PipelineStage[] = [];

  let date: { $gte?: Date; $lte?: Date } = {};

  let status = attributes.status;

  if (!_.isArray(status)) {
    status = [status];
  }

  query.push({
    $match: {
      status: { $in: status },
    },
  });

  if (attributes.user) {
    query.push({
      $match: {
        user: toObjectId(attributes.user),
      },
    });
  }

  if (attributes.from) {
    query.push({
      $match: {
        from: attributes.from,
      },
    });
  }

  if (attributes.to) {
    query.push({
      $match: {
        to: attributes.to,
      },
    });
  }

  if (attributes.endDate) {
    query.push({
      $match: {
        endDate: {
          $lte: dayjs(attributes.endDate).toDate(),
        },
      },
    });
  }

  console.log(dayjs(attributes.endDate).toDate());

  if (attributes.sort) {
    query.push({
      $sort: { [attributes.sort]: -1 },
    });
  }

  query.push(getSkipPipeline((page - 1) * LIMIT));
  query.push(getLimitPipeline(LIMIT));
  query.push(...getLookupPipeline());
  query.push(getProjectPipeline());
  query.push(getAddFieldsPipeline());

  const data = await getService(Services.AD).aggregate(query);

  let isFavoriteDirection = false;

  if (user) {
    let directionDoc = await directionService.findOne({
      hash: attributes.filterHash,
      user: toObjectId(user._id),
    });

    isFavoriteDirection = Boolean(directionDoc);
  }

  return getResponse(
    res,
    {
      data: {
        isFavoriteDirection,
        ads: data,
      },
    },
    StatusCodes.OK
  );
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await getService("ad").remove(getParam(req.params, "id"));

  return getResponse(res, {}, StatusCodes.NO_CONTENT);
});
