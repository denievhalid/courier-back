import { toObjectId } from "@/utils/toObjectId";

export const getMessagesListAggregate = (conversationId: string) => [
  {
    $match: {
      conversation: toObjectId(conversationId),
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
      ad: { $first: "$conversation.ad" },
      message: 1,
      systemAction: 1,
      isSystemMessage: 1,
      type: 1,
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
      user: 1,
      message: 1,
      systemAction: 1,
      isSystemMessage: 1,
      type: 1,
    },
  },
];
