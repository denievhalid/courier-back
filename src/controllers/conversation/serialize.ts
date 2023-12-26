import { MessageType } from "@/types";

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
