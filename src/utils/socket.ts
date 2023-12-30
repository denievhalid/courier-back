import { ConversationType, EmitSocketType } from "@/types";

export const getRoomNameByConversation = (conversation: ConversationType) => {
  return `room${conversation?._id?.toString()}`;
};

export const emitSocket = ({ io, event, room, data }: EmitSocketType) => {
  io.in(room).emit(event, data);
};
