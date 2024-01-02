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

  async send(body: { [k: string]: unknown }) {
    const conversationService = getService(Services.CONVERSATION);
    const messageService = getService(Services.MESSAGE);

    const message = (await messageService.create(body)) as MessageType;

    console.log(message, "message");

    const lastRequestedDeliveryMessage = this.isSystemMessage(message)
      ? message
      : null;

    console.log(lastRequestedDeliveryMessage, "lastRequestedDeliveryMessage");

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

  isSystemMessage({ isSystemMessage, systemAction }: MessageType) {
    return (
      isSystemMessage && systemAction === SystemActionCodes.DELIVERY_REQUESTED
    );
  }
}
