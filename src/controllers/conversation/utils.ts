import { ConversationTypes } from "@/controllers/conversation/types";
import { ConversationType, MessageType, UserType } from "@/types";

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

export const handleUnReadMessagesCount = (
  messages: MessageType[],
  user: UserType
) => {
  const partnerMessages = messages.filter(
    (messageObject: MessageType) =>
      JSON.stringify(messageObject.sender) !== JSON.stringify(user._id)
  );
  const lastReadIndex = partnerMessages.findIndex(
    (message: MessageType) => message.status === "read"
  );
  const unreadCount =
    lastReadIndex !== -1 ? lastReadIndex : partnerMessages.length;
  console.log({ partnerMessages, lastReadIndex, unreadCount });
  return unreadCount;
};
