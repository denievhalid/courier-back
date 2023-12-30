import { getService } from "@/lib/container";
import {
  AdType,
  DeliveryStatus,
  Services,
  SystemActionCodes,
  UserType,
} from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import { DeliveryFacadeProps } from "@/controllers/delivery/types";
import { createMessageHelper } from "@/controllers/message/helpers/createMessage";

export class DeliveryFacade {
  public ad: AdType;
  public user: UserType;
  public status: DeliveryStatus;

  constructor({ ad, status, user }: DeliveryFacadeProps) {
    this.ad = ad;
    this.user = user;
    this.status = status;
  }

  async create() {
    const adService = getService(Services.AD);
    const deliveryService = getService(Services.DELIVERY);

    const adDoc = (await adService.findOne({
      _id: toObjectId(this.ad._id),
      courier: { $eq: null },
    })) as AdType;

    if (!adDoc) {
      throw new Error("Объявление не найдено");
    }

    const payload = {
      ad: toObjectId(this.ad._id),
      user: toObjectId(this.user._id),
    };

    const deliveryDoc = await deliveryService.findOne(payload);

    if (deliveryDoc) {
      throw new Error("Запрос уже отправлен");
    }

    await deliveryService.create({
      ad: toObjectId(this.ad._id),
      user: toObjectId(this.user._id),
      status: this.status,
    });

    // await createMessageHelper({
    //   message: "Вы оправили заявку на доставку",
    //   type: 2,
    //   isSystemMessage: true,
    //   systemAction: SystemActionCodes.DELIVERY_REQUESTED,
    // });
  }
}
