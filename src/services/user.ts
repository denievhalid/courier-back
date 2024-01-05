import { BaseService } from "@/services/base";
import { getModel, getService } from "@/lib/container";
import { DeliveryStatus, Models, Services, UserType } from "@/types";
import { toObjectId } from "@/utils/toObjectId";

export class UserService extends BaseService {
  constructor() {
    super(getModel(Models.USER));
  }

  async getDeliveriesCount(user: UserType) {
    return getService(Services.DELIVERY).count({
      status: DeliveryStatus.RECEIVED,
      user: toObjectId(user._id),
    });
  }
}
