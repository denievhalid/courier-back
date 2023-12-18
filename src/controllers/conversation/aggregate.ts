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
    $lookup: {
      from: "users",
      localField: "$ad.user",
      foreignField: "_id",
      as: "adAuthor",
    },
  },
  {
    $project: {
      ad: { $first: "$ad" },
      adAuthor: 1,
      createdAt: 1,
      isSystemMessage: 1,
      message: 1,
      type: 1,
      systemAction: 1,
      sender: { $first: "$sender" },
    },
  },
];
