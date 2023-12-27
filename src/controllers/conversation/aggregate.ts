import { toObjectId } from "@/utils/toObjectId";
import { ConversationType, UserType } from "@/types";

export const getMessagesListAggregate = (
  conversation: ConversationType,
  user: UserType,
  timeZone: string
) => {
  let matchedObject: any = {
    conversation: toObjectId(conversation._id),
  };
  if (Number(conversation?.deleted?.length) > 0) {
    const desiredDeletedObject = conversation?.deleted?.find(
      (e) => e.forUser.toString() === user._id.toString()
    );
    if (desiredDeletedObject) {
      matchedObject._id = {
        $gt: toObjectId(desiredDeletedObject?.toMessage),
      };
    }
  }

  return [
    {
      $match: matchedObject,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 100,
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
        from: "messages",
        localField: "replayedMessage",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
              as: "sender",
            },
          },
          {
            $addFields: {
              sender: { $first: "$sender" },
            },
          },
        ],
        as: "replayedMessage",
      },
    },
    {
      $project: {
        ad: { $first: "$ad" },
        createdAt: 1,
        isSystemMessage: 1,
        message: 1,
        type: 1,
        isLiked: 1,
        systemAction: 1,
        sender: { $first: "$sender" },
        replayedMessage: { $first: "$replayedMessage" },
      },
    },
    {
      $addFields: {
        isOwn: {
          $cond: [{ $eq: ["$sender._id", user._id] }, true, false],
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: timeZone ?? "Europe/Moscow",
          },
        },
        data: { $push: "$$ROOT" },
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
  ];
};
