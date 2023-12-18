import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { Services } from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";

export const getConversationById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = getParam(req.params, "id");

    const service = getService(Services.CONVERSATION);

    const conversation = await service.findOne({ _id: toObjectId(id) });

    if (!conversation) {
      throw new Error("Разговор не найден");
    }

    _.set(req, "conversation", conversation);

    return next();
  }
);
