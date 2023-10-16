import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import {
  getAttributes,
  getInitialPipeline,
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

export const create = asyncHandler(async (req: Request, res: Response) => {
  await createFormSchema.validate(req.body, { abortEarly: false });

  const attributes = _.pick(req.body, [
    "title",
    "date",
    "to",
    "from",
    "files",
    "weight",
  ]);

  const data = await getService("ad").create({
    ...attributes,
    user: "652a81c89e9c58e546819346",
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

  const query: PipelineStage[] = getInitialPipeline(LIMIT);

  if (_.has(attributes, "match")) {
    query.push(getMatchPipeline(attributes.match));
  }

  if (_.has(attributes, "sort")) {
    query.push(getSortPipeline(attributes.sort));
  }

  query.push(getProjectPipeline());

  const data = await getService("ad").getList(query);

  return getResponse(res, { data });
});
