import { QueryType } from "@/controllers/ad/types";
import { getModel } from "@/lib/container";

export const getList = (query: QueryType) => {
  return getModel("ad").find(query);
};
