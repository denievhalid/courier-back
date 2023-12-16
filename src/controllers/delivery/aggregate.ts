export const getConversationAggregate = (conversationId: string) => [
  {
    $match: {
      _id: conversationId,
    },
  },
  {
    $limit: 1,
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
      let: { id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$$id", "$conversation"] }],
            },
          },
        },
        { $limit: 1 },
      ],
      as: "messages",
    },
  },
  {
    $project: {
      ad: { $first: "$ad" },
      message: { $first: "$messages" },
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "receiver",
      foreignField: "_id",
      as: "receiver",
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
      image: { $first: "$ad.images" },
      message: 1,
      receiver: { $first: "$receiver" },
      sender: { $first: "$sender" },
    },
  },
  {
    $addFields: {
      isNew: true,
    },
  },
];
