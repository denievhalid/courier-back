import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import {
  getAttributes,
  getLimitAggregatePipeline,
  getMatchAggregatePipeline,
  getSortAggregatePipeline,
} from "@/controllers/ad/utils";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { LIMIT } from "@/controllers/ad/const";

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");

  const data = await getService("ad").getById(id);

  return getResponse(res, { data });
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const attributes = getAttributes(req.query);

  const query = [];

  if (_.has(attributes, "user")) {
    query.push(getMatchAggregatePipeline(attributes.user));
  }

  if (_.has(attributes, "sort")) {
    query.push(getSortAggregatePipeline(attributes.sort));
  }

  query.push(getLimitAggregatePipeline(LIMIT));

  const data = await getService("ad").getList(query);

  return getResponse(res, { data });
});
