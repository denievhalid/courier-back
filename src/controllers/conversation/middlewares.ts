import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { Services } from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";

export const getConversationById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = getParam(req.params, "id");

    const service = getService(Services.CONVERSATION);

    const conversation = await service.aggregate([
      {
        $match: {
          _id: toObjectId(id),
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
        $lookup: {
          from: "users",
          localField: "courier",
          foreignField: "_id",
          as: "courier",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "adAuthor",
          foreignField: "_id",
          as: "adAuthor",
        },
      },
      {
        $project: {
          _id: 1,
          ad: { $first: "$ad" },
          adAuthor: { $first: "$ad.adAuthor" },
          courier: { $first: "$courier" },
          cover: 1,
        },
      },
      {
        $addFields: {
          ad: {
            cover: { $first: "$ad.images" },
          },
        },
      },
    ]);

    if (!conversation) {
      throw new Error("Разговор не найден");
    }

    _.set(req, "conversation", _.first(conversation));

    return next();
  }
);
