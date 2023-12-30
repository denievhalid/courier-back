import { MessageFacade } from "@/controllers/conversation/facade";
import { ConversationType, SystemActionCodes, UserType } from "@/types";

export enum ConversationTypes {
  INBOX = "inbox",
  SENT = "sent",
}

export type MessageFacadeProps = {
  conversation: ConversationType;
  isSystemMessage: boolean;
  message: string;
  type: number;
  user: UserType;
  systemAction: SystemActionCodes;
};
