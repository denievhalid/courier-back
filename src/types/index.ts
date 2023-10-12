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

export type OtpType = {
  _id: string;
  deadline: Date;
  user: UserType;
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
