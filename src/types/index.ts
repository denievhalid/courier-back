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
};

export type BlockType = {
  user: UserType;
  blockedUser: UserType;
};

export type ConversationType = {
  ad: AdType;
  receiver: UserType;
  sender: UserType;
};

export type DirectionType = {
  ads: string[];
};

export type MessageType = {
  message: string;
  user: UserType;
  status: string;
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
  status: string;
};

export type FavoriteType = {
  ad: string;
  user: string;
};

export type VerifyType = {
  otp: string;
  secret: string;
};
