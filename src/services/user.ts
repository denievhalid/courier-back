import { getModel } from "@/lib/container";
import { UserType } from "@/types";

export const register = () => {};

export const findOne = (payload: UserType) => {
  return getModel("user").findOne(payload);
};
