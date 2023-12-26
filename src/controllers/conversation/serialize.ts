import { MessageType } from "@/types";

type SerializeMessagesType = {
  _id: string;
  messages: MessageType[];
};

export const serializeMessages = (messages: SerializeMessagesType[]) => {
  return messages.reduce(
    (acc, current) => ({ [current._id]: current.messages }),
    {}
  );
};

export const serializeMessage = (
  { _id, message, sender, status, isSystemMessage, systemAction }: MessageType,
  other?: any
) => ({
  isSystemMessage,
  message,
  sender,
  status,
  systemAction,
  ...other,
});
