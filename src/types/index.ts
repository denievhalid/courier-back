export type HttpMethods = "get" | "post" | "patch" | "put" | "delete";

export type RouteType = {
  method: HttpMethods;
  path: string;
  handler: string;
};
