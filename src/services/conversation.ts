import { BaseService } from "@/services/base";
import { getModel, getService } from "@/lib/container";
import { Models, Services } from "@/types";
import { getParam } from "@/utils/getParam";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";

export class ConversationService extends BaseService {
  constructor() {
    super(getModel(Models.CONVERSATION));
  }

  async getById(_id: string) {
    const conversation = await getService(Services.CONVERSATION).aggregate([
      {
        $match: {
          _id: toObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "ads",
          localField: "ad",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "courier",
                foreignField: "_id",
                as: "adCourier",
              },
            },
          ],
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
          adAuthor: { $first: "$adAuthor" },
          courier: { $first: "$courier" },
          cover: 1,
          lastRequestedDeliveryMessage: 1,
          deleted: 1,
          lastMessage: 1,
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

    return _.first(conversation);
  }
}
