import { toObjectId } from "@/utils/toObjectId";
import { ConversationType, UserType } from "@/types";

export const getMessagesListAggregate = (
  conversation: ConversationType,
  user: UserType
) => [
  {
    $match: {
      conversation: toObjectId(conversation._id),
    },
  },
  {
    $sort: {
      createdAt: -1,
    },
  },
  {
    $lookup: {
      from: "conversations",
      localField: "conversation",
      foreignField: "_id",
      as: "conversation",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "sender",
      foreignField: "_id",
      as: "sender",
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
    $project: {
      ad: { $first: "$ad" },
      createdAt: 1,
      isSystemMessage: 1,
      message: 1,
      type: 1,
      systemAction: 1,
      sender: { $first: "$sender" },
    },
  },
  {
    $addFields: {
      isOwn: {
        $cond: [{ $eq: ["$sender._id", user._id] }, true, false],
      },
    },
  },
];
