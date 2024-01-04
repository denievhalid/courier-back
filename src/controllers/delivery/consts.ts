import { DeliveryStatus, SystemActionCodes } from "@/types";

export const handleUpdateDeliveryMessage = (state: DeliveryStatus) => {
  switch (state) {
    case DeliveryStatus.APPROVED:
      return { systemAction: SystemActionCodes.DELIVERY_CONFIRMED, type: 1 };
    case DeliveryStatus.COMPLETED:
      return { systemAction: SystemActionCodes.DELIVERY_COMPLETED, type: 1 };
    case DeliveryStatus.RECEIVED:
      return { systemAction: SystemActionCodes.DELIVERY_RECEIVED, type: 1 };
    case DeliveryStatus.REJECTED:
      return {
        systemAction: SystemActionCodes.DELIVERY_CANCELED_BY_OWNER,
        type: 0,
      };
    default:
      return {
        systemAction: SystemActionCodes.DELIVERY_CANCELED_BY_OWNER,
        type: 0,
      };
  }
};
