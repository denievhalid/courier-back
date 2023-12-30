import { SOCKET_EVENTS } from "@/const";
import { ConversationTypes } from "@/controllers/conversation/types";
import {
  getConversationCompanion,
  handleUnReadMessagesCount,
} from "@/controllers/conversation/utils";
import { getService } from "@/lib/container";
import {
  getSystemMessageText,
  handlePushNotification,
} from "@/services/notification";
import {
  ConversationType,
  IOType,
  MessageType,
  Services,
  SystemActionCodes,
  TCreateMessage,
  TNotificationData,
  UserType,
} from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";

export const createMessageHelper = async ({
  io,
  user,
  conversation,
  message,
  type,
  isSystemMessage,
  systemAction,
  replayedMessage,
}: {
  io: IOType;
  user: UserType;
  conversation: ConversationType;
  message: string;
  type: number;
  isSystemMessage: boolean;
  systemAction: SystemActionCodes;
  replayedMessage?: MessageType;
}) => {
  const conversationService = getService(Services.CONVERSATION);
  const messageService = getService(Services.MESSAGE);

  const messageDoc = await messageService.create({
    isSystemMessage,
    conversation,
    message,
    sender: user,
    type,
    systemAction,
    replayedMessage,
  });

  const conversationUpdatedPayload: {
    lastRequestedDeliveryMessage?: MessageType;
    lastMessage: MessageType;
  } = {
    lastMessage: messageDoc,
  };

  if (messageDoc.isSystemMessage) {
    conversationUpdatedPayload.lastRequestedDeliveryMessage =
      messageDoc.systemAction === SystemActionCodes.DELIVERY_REQUESTED
        ? messageDoc
        : null;
  }

  await conversationService.update(
    { _id: toObjectId(conversation._id) },
    conversationUpdatedPayload
  );

  const newMessage = await messageService.aggregate([
    {
      $match: {
        _id: toObjectId(messageDoc._id),
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
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },
    {
      $project: {
        sender: { $first: "$sender" },
        message: 1,
        conversation: { $first: "$conversation" },
        systemAction: 1,
        isSystemMessage: 1,
        type: 1,
        replayedMessage: { $first: "$replayedMessage" },
      },
    },
  ]);

  const newMessageObject = _.first(newMessage) as MessageType;
  const data = {
    message: newMessageObject,
    isSystemMessage,
    systemAction,
    type,
  };

  io.to(`room${conversation?._id?.toString()}`).emit(
    SOCKET_EVENTS.NEW_MESSAGE,
    {
      message: newMessageObject,
      lastRequestedDeliveryMessage:
        conversationUpdatedPayload?.lastRequestedDeliveryMessage?._id,
    }
  );

  const companion = getConversationCompanion(conversation, user);
  const AllMessages = await messageService.find({
    conversation: toObjectId(conversation?._id),
  });
  //.sort({ createdAt: -1 })
  //.limit(100);

  const unreadMessagesCount = handleUnReadMessagesCount(AllMessages, companion);

  io.to(companion?._id?.toString()).emit(SOCKET_EVENTS.UPDATE_CONVERSATION, {
    conversation: {
      ...conversation,
      lastMessage: messageDoc,
      unreadMessagesCount,
      companion: user,
      cover: conversation?.ad?.images[0],
      lastRequestedDeliveryMessage:
        conversationUpdatedPayload?.lastRequestedDeliveryMessage?._id,
    },
    type:
      JSON.stringify(conversation.courier._id) === JSON.stringify(companion._id)
        ? ConversationTypes.SENT
        : ConversationTypes.INBOX,
  });

  const messageText = newMessageObject?.isSystemMessage
    ? newMessageObject?.systemAction &&
      getSystemMessageText(
        newMessageObject?.systemAction,
        conversation?.courier?.firstname
      )
    : {
        sender: newMessageObject?.message,
        receiver: newMessageObject?.message,
      };

  const notificationData: TNotificationData = {
    screen: "Message",
    params: { conversationId: conversation._id },
    systemMessage: messageText,
  };
  companion?.notificationTokens &&
    handlePushNotification(
      companion?.notificationTokens,
      newMessageObject.sender.firstname,
      notificationData,
      newMessageObject?.message
    );

  return data;
};
