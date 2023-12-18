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
    $project: {
      createdAt: 1,
      isSystemMessage: 1,
      message: 1,
      type: 1,
      systemAction: 1,
      user: { $first: "$sender" },
    },
  },
  {
    $project: {
      ad: { $first: "$ad" },
      createdAt: "$createdAt",
      sender: 1,
      message: 1,
      isSystemMessage: 1,
      type: 1,
      systemAction: 1,
    },
  },
];
