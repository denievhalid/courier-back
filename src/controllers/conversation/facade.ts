import { getService } from "@/lib/container";
import {
  ConversationType,
  MessageType,
  Services,
  SystemActionCodes,
  UserType,
} from "@/types";
import { MessageFacadeProps } from "@/controllers/conversation/types";
import _ from "lodash";
import { toObjectId } from "@/utils/toObjectId";

export class MessageFacade {
  public conversation: ConversationType | undefined;
  public isSystemMessage: boolean | undefined;
  public message: string | undefined;
  public systemAction: SystemActionCodes | undefined;
  public type: number | undefined;
  public user: UserType | undefined;

  constructor(props: MessageFacadeProps) {
    _.assign(this, props);
  }

  async create() {
    const conversationService = getService(Services.CONVERSATION);
    const messageService = getService(Services.MESSAGE);

    const messageDoc = (await messageService.create(this)) as MessageType;

    const { conversation, isSystemMessage, systemAction, type } = this;

    const conversationUpdatedPayload: {
      lastRequestedDeliveryMessage?: MessageType | null;
      lastMessage: MessageType;
    } = {
      lastMessage: messageDoc,
      lastRequestedDeliveryMessage: null,
    };

    if (
      messageDoc.isSystemMessage &&
      messageDoc.systemAction === SystemActionCodes.DELIVERY_REQUESTED
    ) {
      conversationUpdatedPayload.lastRequestedDeliveryMessage = messageDoc;
    }

    await conversationService.update(
      { _id: toObjectId(conversation!._id) },
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

    return {
      message: _.first(newMessage),
      isSystemMessage,
      systemAction,
      type,
    };
  }
}
