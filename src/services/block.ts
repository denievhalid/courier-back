import { BaseService } from "@/services/base";
import { getModel } from "@/lib/container";
import { Models } from "@/types";

export class BlockService extends BaseService {
  constructor() {
    super(getModel(Models.BLOCK));
  }
}
