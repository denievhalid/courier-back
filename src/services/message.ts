import { BaseService } from "@/services/base";
import { getModel, getService } from "@/lib/container";
import {
  ConversationType,
  MessageType,
  Models,
  Services,
  SystemActionCodes,
  TNotificationData,
  UserType,
} from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";
import {
  getConversationCompanion,
  getMessageByIdAggregate,
} from "@/controllers/conversation/utils";
import {
  getSystemMessageText,
  handlePushNotification,
  handleSystemMessageNotificationText,
} from "./notification";

export class MessageService extends BaseService {
  constructor() {
    super(getModel(Models.MESSAGE));
  }

  async send(body: Record<string, any>) {
    const conversationService = getService(Services.CONVERSATION);
    const messageService = getService(Services.MESSAGE);

    const message = (await messageService.create(body)) as MessageType;

    const lastRequestedDeliveryMessage =
      this.handleLastRequestedDeliveryMessage(message);

    await conversationService.update(
      { _id: toObjectId(message?.conversation?._id) },
      {
        lastMessage: message,
        lastRequestedDeliveryMessage,
      }
    );

    const companion = getConversationCompanion(
      body?.conversation as ConversationType,
      body.sender as UserType
    ) as UserType;

    const messageText = message?.isSystemMessage
      ? handleSystemMessageNotificationText(message?.systemAction)
      : message?.message;

    const notificationData: TNotificationData = {
      screen: "Message",
      params: { conversationId: message?.conversation?._id },
    };

    companion?.notificationTokens &&
      handlePushNotification(
        companion?.notificationTokens,
        body.sender.firstname,
        notificationData,
        messageText
      );

    return {
      message: _.first(
        await messageService.aggregate(getMessageByIdAggregate(message?._id))
      ) as MessageType,
      lastRequestedDeliveryMessage,
    };
  }

  handleLastRequestedDeliveryMessage(message: MessageType) {
    const { isSystemMessage, systemAction } = message;
    if (isSystemMessage) {
      if (systemAction === SystemActionCodes.DELIVERY_REQUESTED) return message;
      return null;
    }
  }
}
