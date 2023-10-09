import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import { getAttributes } from "@/controllers/ad/utils";
import _ from "lodash";
import { QueryType } from "@/controllers/ad/types";
import { getService } from "@/lib/container";

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const attributes = getAttributes(req.query);

  const query = {} as QueryType;

  if (_.has(attributes, "sort")) {
    query.sort = attributes.sort;
  }

  const data = await getService("ad").getList(query);

  return getResponse(res, { data });
});
