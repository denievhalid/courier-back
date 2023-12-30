import { getService } from "@/lib/container";
import {
  ConversationType,
  Services,
  SystemActionCodes,
  UserType,
} from "@/types";
import { MessageFacadeProps } from "@/controllers/conversation/types";
import _ from "lodash";

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

    await messageService.create(this);
  }
}
