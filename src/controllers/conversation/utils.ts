import { Conversation } from "@/controllers/conversation/types";

export const getUserByConversationType = {
  [Conversation.INBOX]: "receiver",
  [Conversation.SENT]: "sender",
};
