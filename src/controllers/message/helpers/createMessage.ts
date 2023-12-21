import { SOCKET_EVENTS } from "@/const";
import { getService } from "@/lib/container";
import {
  IOType,
  Services,
  SystemActionCodes,
  TCreateMessage,
  UserType,
} from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";

export const createMessageHelper = async ({
  io,
  sender,
  conversationId,
  message,
  type,
  isSystemMessage,
  systemAction,
}: {
  io: IOType;
  sender: UserType;
  conversationId: string;
  message: string;
  type: number;
  isSystemMessage: boolean;
  systemAction: SystemActionCodes;
}) => {
  const conversationService = getService(Services.CONVERSATION);

  const conversation = await conversationService.findOne({
    _id: toObjectId(conversationId),
  });

  const messageService = getService(Services.MESSAGE);

  const messageDoc = await messageService.create({
    isSystemMessage,
    conversation,
    message,
    sender,
    type,
    systemAction,
  });

  const data = await messageService.aggregate([
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
  ]);

  const newMessage: TCreateMessage | undefined = _.first(data);
  const adId = _.get(newMessage, "ad._id", null);

  if (adId && newMessage) {
    const delivery = (newMessage.delivery = (
      await getService("delivery").findOne({
        ad: toObjectId(adId),
        user: toObjectId(sender._id),
      })
    )?.status);
  }

  // для диалога
  io.to(conversation?._id?.toString()).emit(
    SOCKET_EVENTS[isSystemMessage ? "SYSTEM_ACTION" : "NEW_MESSAGE"],
    newMessage
  );

  const allConversations = await conversationService.find({
    _id: toObjectId(conversationId),
  });
  // Для страницы ConversationScreen
  io.to(conversation?._id?.toString()).emit(
    SOCKET_EVENTS.UPDATE_CONVERSATION,
    allConversations
  );

  return newMessage;
};
