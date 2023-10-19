import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import {
  getAddFieldsPipeline,
  getAttributes,
  getLimitPipeline,
  getLookupPipeline,
  getMatchPipeline,
  getProjectPipeline,
  getSortPipeline,
} from "@/controllers/ad/utils";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { LIMIT } from "@/controllers/ad/const";
import { PipelineStage } from "mongoose";
import { createFormSchema } from "@/controllers/ad/validation";
import { array } from "yup";
import { UserType } from "@/types";

export const create = asyncHandler(async (req: Request, res: Response) => {
  await createFormSchema.validate(req.body, { abortEarly: false });

  const user = _.first(getParam(req, "user")) as UserType;

  const attributes = _.pick(req.body, [
    "title",
    "date",
    "to",
    "price",
    "from",
    "images",
    "weight",
    "comment",
  ]);

  const data = await getService("ad").create({
    ...attributes,
    user: user?._id,
  });

  return getResponse(res, { data });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");

  const data = await getService("ad").getById(id);

  return getResponse(res, { data });
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const attributes = getAttributes(req.query);

  const query: PipelineStage[] = [];

  if (_.has(attributes, "match")) {
    query.push(getMatchPipeline(attributes.match));
  }

  if (_.has(attributes, "sort")) {
    query.push(getSortPipeline(attributes.sort));
  }

  query.push(getLookupPipeline());
  query.push(getProjectPipeline());

  const data = await getService("ad").getList(query);

  return getResponse(res, { data });
});
