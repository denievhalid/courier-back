export const DataType = {
  string: "string",
  number: "number",
};

export enum SocketEvents {
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  BLOCK_USER = "blockUser",
  NEW_CONVERSATION = "newConversation",
  UPDATE_CONVERSATION = "updateConversation",
  NEW_MESSAGE = "newMessage",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  USER_ONLINE = "userOnline",
  TYPING = "typing",
  SYSTEM_ACTION = "systemAction",
  UPDATE_DELIVERY_STATUS = "updateDeliveryStatus",
  UPDATE_AD_COURIER = "updateAdCourier",
}

export enum Env {
  PORT = "port",
  JWT_SECRET = "jwt_secret",
}
