import { BaseService } from "@/services/base";
import { getModel, getService } from "@/lib/container";
import { DeliveryStatus, Models, Services, UserType } from "@/types";
import { toObjectId } from "@/utils/toObjectId";

export class DeliveryService extends BaseService {
  constructor() {
    super(getModel(Models.DELIVERY));
  }

  async getDeliveriesCount(user: UserType) {
    return this.count({
      status: DeliveryStatus.RECEIVED,
      user: toObjectId(user._id),
    });
  }
}
