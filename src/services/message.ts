import { getModel } from "@/lib/container";
import type { MessageType } from "@/types";

export const create = (payload: MessageType) => {
  return getModel("message").create(payload);
};
