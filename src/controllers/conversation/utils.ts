import { ConversationTypes } from "@/controllers/conversation/types";
import { ConversationType, MessageType, UserType } from "@/types";
import { AggregateBuilder } from "@/lib/builder";
import { toObjectId } from "@/utils/toObjectId";

export const getUserByConversationType = {
  [ConversationTypes.INBOX]: "adAuthor",
  [ConversationTypes.SENT]: "courier",
};

export const getConversationCompanion = (
  conversation: ConversationType,
  user: UserType
) => {
  return conversation?.adAuthor?._id?.toString() === user._id.toString()
    ? conversation?.courier
    : conversation?.adAuthor;
};

export const handleUnReadMessagesCount = (
  messages: MessageType[],
  user: UserType
) => {
  const partnerMessages = messages.filter(
    (messageObject: MessageType) =>
      JSON.stringify(messageObject.sender) !== JSON.stringify(user._id)
  );
  const lastReadIndex = partnerMessages.findIndex(
    (message: MessageType) => message.status === "read"
  );
  const unreadCount =
    lastReadIndex !== -1 ? lastReadIndex : partnerMessages.length;
  return unreadCount;
};

export const getMessageByIdAggregate = (id: string) => {
  return AggregateBuilder.init()
    .match({ _id: toObjectId(id) })
    .lookup({
      from: "conversations",
      localField: "conversation",
      foreignField: "_id",
      as: "conversation",
    })
    .lookup({
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
    })
    .lookup({
      from: "users",
      localField: "sender",
      foreignField: "_id",
      as: "sender",
    })
    .project({
      sender: { $first: "$sender" },
      message: 1,
      conversation: { $first: "$conversation" },
      systemAction: 1,
      isSystemMessage: 1,
      type: 1,
      replayedMessage: { $first: "$replayedMessage" },
    })
    .build();
};
