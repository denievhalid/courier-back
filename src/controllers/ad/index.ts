import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import {
  getAttributes,
  getInitialAggregatePipeline,
  getLimitAggregatePipeline,
  getMatchAggregatePipeline,
  getProjectAggregatePipeline,
  getSortAggregatePipeline,
} from "@/controllers/ad/utils";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { LIMIT } from "@/controllers/ad/const";
import { PipelineStage } from "mongoose";

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");

  const data = await getService("ad").getById(id);

  return getResponse(res, { data });
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const attributes = getAttributes(req.query);

  const query: PipelineStage[] = getInitialAggregatePipeline(LIMIT);

  if (_.has(attributes, "match")) {
    query.push(getMatchAggregatePipeline(attributes.match));
  }

  if (_.has(attributes, "sort")) {
    query.push(getSortAggregatePipeline(attributes.sort));
  }

  query.push(getProjectAggregatePipeline());

  const data = await getService("ad").getList(query);

  return getResponse(res, { data });
});
