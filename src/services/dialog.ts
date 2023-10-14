import { getModel } from "@/lib/container";
import type { DialogType } from "@/types";

export const create = (payload: DialogType) => {
  return getModel("dialog").create(payload);
};
