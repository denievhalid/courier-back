import { toObjectId } from "@/utils/toObjectId";

export const getMessagesListAggregate = (conversationId: string) => [
  {
    $match: {
      conversation: toObjectId(conversationId),
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
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  },
  {
    $project: {
      createdAt: 1,
      isSystemMessage: 1,
      message: 1,
      type: 1,
      systemAction: 1,
      user: { $first: "$user" },
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
      createdAt: "$createdAt",
      user: 1,
      message: 1,
      isSystemMessage: 1,
      type: 1,
      systemAction: 1,
    },
  },
];
