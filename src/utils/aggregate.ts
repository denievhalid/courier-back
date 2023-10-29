import { getService } from "@/lib/container";

export const getUserAggregate = (phoneNumber: number | string) => {
  const userService = getService("user");

  return userService.aggregate([
    {
      $match: {
        active: true,
        phoneNumber: Number(phoneNumber),
      },
    },
    {
      $lookup: {
        from: "conversations",
        localField: "_id",
        foreignField: "receiver",
        as: "inboxConversations",
      },
    },
    {
      $lookup: {
        from: "conversations",
        localField: "_id",
        foreignField: "sender",
        as: "sentConversations",
      },
    },
    {
      $lookup: {
        from: "delivery",
        localField: "_id",
        foreignField: "user",
        as: "deliveries",
      },
    },
    {
      $project: {
        firstname: 1,
        avatar: 1,
        gender: 1,
        phoneNumber: 1,
        city: 1,
        deliveries: { $size: "$deliveries" },
        inboxConversations: { $size: "$inboxConversations" },
        sentConversations: { $size: "$sentConversations" },
      },
    },
  ]);
};
