import { BaseService } from "@/services/base";
import { getModel } from "@/lib/container";
import { Models } from "@/types";

export class DeliveryService extends BaseService {
  constructor() {
    super(getModel(Models.DELIVERY));
  }
}
