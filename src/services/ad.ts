import { BaseService } from "@/services/base";
import { getModel } from "@/lib/container";
import { Models } from "@/types";

export class AdService extends BaseService {
  constructor() {
    super(getModel(Models.AD));
  }
}
