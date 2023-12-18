import { ConversationTypes } from "@/controllers/conversation/types";

export const getUserByConversationType = {
  [ConversationTypes.INBOX]: "adAuthor",
  [ConversationTypes.SENT]: "courier",
};
