import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import { getAttributes, getListAggregateBuilder } from "@/controllers/ad/utils";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import mongoose, { PipelineStage } from "mongoose";
import { createAdSchema } from "@/controllers/ad/validation";
import { DeliveryStatus, Services, UserType } from "@/types";
import { StatusCodes } from "http-status-codes";
import { toObjectId } from "@/utils/toObjectId";

export const create = asyncHandler(async (req: Request, res: Response) => {
  await createAdSchema.validate(req.body, { abortEarly: false });

  const user = getParam(req, "user") as UserType;

  const attributes = req.body;

  if (attributes.startDate) {
    attributes.startDate = new Date(attributes.startDate);
  }

  if (attributes.endDate) {
    attributes.endDate = new Date(attributes.endDate);
  }

  const data = await getService(Services.AD).create({
    ...attributes,
    user: user._id,
  });

  return getResponse(res, { data });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const _id = getParam(req.params, "id");
  const user = getParam(req, "user") as UserType;

  const adService = getService(Services.AD);

  await adService.update({ _id }, req.body);

  const pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        _id: toObjectId(_id),
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
          $cond: [{ $eq: ["$user._id", toObjectId(user._id)] }, true, false],
        },
      },
    });
  }

  const data = await adService.aggregate(pipeline);

  return getResponse(res, { data: _.first(data) });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const user = getParam(req, "user") as UserType;

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
      $lookup: {
        from: "conversations",
        pipeline: [
          {
            $match: {
              $and: [
                { ad: toObjectId(id) },
                {
                  $or: [
                    { adAuthor: toObjectId(user._id) },
                    { courier: toObjectId(user._id) },
                  ],
                },
              ],
            },
          },
        ],
        as: "conversation",
      },
    },
    {
      $addFields: {
        user: { $first: "$user" },
        conversation: { $first: "$conversation" },
      },
    }
  );

  let deliveryStatus = null;

  if (user) {
    const isFavorite = await getService(Services.FAVORITE).count({
      ad: toObjectId(id),
      user: toObjectId(user._id),
    });

    pipeline.push({
      $addFields: {
        isFavorite: Boolean(isFavorite),
        isOwn: {
          $cond: [{ $eq: ["$user._id", toObjectId(user._id)] }, true, false],
        },
      },
    });

    deliveryStatus = (
      await getService(Services.DELIVERY).findOne({
        ad: toObjectId(id),
        user: toObjectId(user._id),
      })
    )?.status;
  }

  const data = _.first(await getService(Services.AD).aggregate(pipeline));

  if (_.isObject(data)) {
    _.set(data, "deliveryStatus", deliveryStatus);
  }

  return getResponse(res, { data }, StatusCodes.OK);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const queryParams = getAttributes(req.query);
  const user = getParam(req, "user") as UserType;

  const adService = await getService(Services.AD);

  const ads = await adService.aggregate(getListAggregateBuilder(queryParams));

  let isFavoriteDirection = false;

  if (user) {
    isFavoriteDirection = Boolean(
      await getService(Services.DIRECTION).findOne({
        hash: queryParams.filterHash,
        user: toObjectId(user._id),
      })
    );
  }

  return getResponse(
    res,
    { data: { ads, isFavoriteDirection } },
    StatusCodes.OK
  );
});

export const getDeliveredAds = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getParam(req.params, "userId") as string;
    const user = getParam(req, "user") as UserType;

    const person = await getService(Services.USER)
      .findOne({
        _id: toObjectId(userId),
      })
      .lean();

    const isBlocked = Boolean(
      await getService(Services.BLOCK).count({
        user: toObjectId(user._id),
        blockedUser: toObjectId(userId),
      })
    );

    const docs = await getService(Services.DELIVERY).aggregate([
      {
        $match: {
          user: toObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "ads",
          localField: "ad",
          foreignField: "_id",
          as: "ad",
        },
      },
      {
        $unwind: "$ad",
      },
      {
        $facet: {
          ended: [{ $match: { status: { $in: [DeliveryStatus.RECEIVED] } } }],
          active: [{ $match: { status: { $nin: [DeliveryStatus.RECEIVED] } } }],
        },
      },
      {
        $project: {
          ended: 1,
          active: 1,
          deliveriesCount: { $size: "$ended" },
        },
      },
    ]);

    const data = _.first(docs) as object;

    return getResponse(res, {
      data: {
        ...data,
        user: {
          ...person,
          isBlocked,
        },
      },
    });
  }
);

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");

  await getService(Services.AD).remove({
    _id: toObjectId(id),
  });

  await getService(Services.FAVORITE).removeAll({
    ad: toObjectId(id),
  });

  return getResponse(res, {}, StatusCodes.NO_CONTENT);
});

export const updateByBot = asyncHandler(async (req: Request, res: Response) => {
  const _id = getParam(req.params, "id");

  await getService(Services.AD).update({ _id }, req.body);

  return getResponse(res);
});
