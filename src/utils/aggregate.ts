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
      $lookup: {
        from: "favorites",
        localField: "_id",
        foreignField: "user",
        as: "favorites",
      },
    },
    {
      $lookup: {
        from: "directions",
        localField: "_id",
        foreignField: "user",
        as: "directions",
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
        counters: {
          favoriteAds: { $size: "$favorites" },
          favoriteDirections: { $size: "$directions" },
          inboxConversations: { $size: "$inboxConversations" },
          sentConversations: { $size: "$sentConversations" },
        },
      },
    },
  ]);
};
