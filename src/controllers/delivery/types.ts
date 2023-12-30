import { AdType, DeliveryStatus, UserType } from "@/types";

export type DeliveryFacadeProps = {
  ad: AdType;
  status: DeliveryStatus;
  user: UserType;
};
