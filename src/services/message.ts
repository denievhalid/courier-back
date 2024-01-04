import { BaseService } from "@/services/base";
import { getModel, getService } from "@/lib/container";
import { MessageType, Models, Services, SystemActionCodes } from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";
import { getMessageByIdAggregate } from "@/controllers/conversation/utils";

export class MessageService extends BaseService {
  constructor() {
    super(getModel(Models.MESSAGE));
  }

  async send(body: Record<string, unknown>) {
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
