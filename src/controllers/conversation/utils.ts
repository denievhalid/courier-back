import { ConversationTypes } from "@/controllers/conversation/types";
import { ConversationType, UserType } from "@/types";

export const getUserByConversationType = {
  [ConversationTypes.INBOX]: "adAuthor",
  [ConversationTypes.SENT]: "courier",
};

export const getConversationCompanion = (
  conversation: ConversationType,
  user: UserType
) =>
  conversation.courier?._id.toString() === user._id.toString()
    ? conversation?.adAuthor
    : conversation?.courier;
