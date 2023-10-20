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
};

export type DialogType = {
  users: UserType[];
  type: "pending" | "sent" | "read";
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
  PENDING = "pending",
  REJECTED = "rejected",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}
