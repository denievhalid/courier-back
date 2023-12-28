import type { Aggregate, PipelineStage, Query } from "mongoose";
import { string } from "yup";

export type HttpMethods = "get" | "post" | "patch" | "put" | "delete";

export type RouteType = {
  method: HttpMethods;
  path: string;
  handler: string;
};

export type DaDataRouteType = {};

export type AdType = {
  _id: string;
  title: string;
  weight: number;
  route: DaDataRouteType;
  courier?: UserType;
  user: UserType;
  images: string[];
};

export type ParticipantType = {
  _id: string;
  conversation: ConversationType;
  courier: UserType;
  adAuthor: UserType;
};

export type BlockType = {
  user: UserType;
  blockedUser: UserType;
};

export type ConversationType = {
  _id: string;
  ad: AdType;
  adAuthor: UserType;
  courier: UserType;
  lastMessage?: MessageType;
  lastRequestedDeliveryMessage?: MessageType;
  deleted?: TDeletedConversationType[];
};

export type TDeletedConversationType = {
  forUser: string;
  toMessage: string;
};

export type DirectionType = {
  ads: string[];
  hash: string;
  filter: string;
};

export type MessageType = {
  _id: string;
  message: string;
  sender: UserType;
  status: string;
  isSystemMessage?: boolean;
  systemAction?: SystemActionCodes;
  type?: number;
  isLiked?: number;
  replayedMessage?: MessageType;
};

export type TCreateMessage = {
  message: string;
  user: UserType;
  isSystemMessage?: boolean;
  systemAction?: SystemActionCodes;
  delivery: DeliveryStatus;
};
export type OtpType = {
  _id: string;
  deadline: Date;
  otp: number;
  phoneNumber: number;
};

export type UserType = {
  _id: string;
  firstname: string;
  phoneNumber: number;
  courier?: boolean | undefined;
  notificationTokens?: string[];
};

export interface IService {
  create: (payload: any) => Promise<any>;
  getById: (id: string) => Query<any, any>;
  getList: (pipeline: PipelineStage[]) => Aggregate<Array<any>>;
}

export enum AdStatus {
  APPROVED = "approved",
  DRAFT = "draft",
  PENDING = "pending",
  REJECTED = "rejected",
}

export enum DeliveryStatus {
  APPROVED = "approved",
  PENDING = "pending",
  REJECTED = "rejected",
}

export enum MessageStatus {
  SEND = "sent",
  PENDING = "pending",
  READ = "read",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export type DeliveryType = {
  ad: AdType;
  user: UserType;
  status: DeliveryStatus;
};

export type FavoriteType = {
  ad: string;
  user: string;
};

export type VerifyType = {
  otp: string;
  secret: string;
};

export enum SystemActionCodes {
  DELIVERY_REQUESTED = "DELIVERY_REQUESTED",
  DELIVERY_EXPIRED = "DELIVERY_EXPIRED",
  DELIVERY_CONFIRMED = "DELIVERY_CONFIRMED",
  DELIVERY_CANCELED = "DELIVERY_CANCELED",
}

export enum Services {
  AD = "ad",
  BLOCK = "block",
  CONVERSATION = "conversation",
  DELIVERY = "delivery",
  DIRECTION = "direction",
  MESSAGE = "message",
  USER = "user",
}

export enum Routes {
  ADS = "ads",
  AUTH = "auth",
  BLOCKS = "blocks",
  CONVERSATIONS = "conversations",
  DELIVERIES = "deliveries",
  DIRECTIONS = "directions",
  FAVORITES = "favorites",
  FILES = "files",
  MESSAGES = "messages",
  USERS = "users",
}

export type IOType = {
  to: (room: string) => {
    emit: (event: string, data: any) => void;
  };
};

export type TNotificationData = {
  screen: string;
  params: {
    conversationId: string;
  };
  systemMessage?: {
    sender: string;
    receiver: string;
  };
};
