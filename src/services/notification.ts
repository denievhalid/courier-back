import {
  MessageType,
  SystemActionCodes,
  TMessageBlock,
  TNotificationData,
} from "@/types";
import {
  Expo,
  ExpoPushMessage,
  ExpoPushReceiptId,
  ExpoPushSuccessTicket,
  ExpoPushTicket,
} from "expo-server-sdk";

export const getSystemMessageText = (
  systemAction: SystemActionCodes,
  userName: string
) => {
  switch (systemAction) {
    case SystemActionCodes.DELIVERY_REQUESTED:
    case SystemActionCodes.DELIVERY_EXPIRED:
      return {
        sender: "Вы отправили заявку на доставку посылки. Ждем...",
        receiver: `${userName} предлагает доставить вашу посылку`,
      };
    case SystemActionCodes.DELIVERY_CONFIRMED:
      return {
        sender: `Вашу посылку доставит ${userName}`,
        receiver: "Вас выбрали в качестве курьера",
      };
    case SystemActionCodes.DELIVERY_CANCELED:
      return {
        sender: "Вы отказались доставлять посылку",
        receiver: `${userName} передумал доставлять вашу посылку`,
      };
  }
};

export const handleSystemMessageNotificationText = (
  systemAction?: SystemActionCodes
) => {
  switch (systemAction) {
    case SystemActionCodes.DELIVERY_REQUESTED:
      return "У вас новая заявка на доставку";
    case SystemActionCodes.DELIVERY_CONFIRMED:
      return "Ваша заявка согласована";
    case SystemActionCodes.DELIVERY_CANCELED:
      return "Заявка отменена курьером";
    case SystemActionCodes.DELIVERY_CANCELED_BY_OWNER:
      return "Вам отказали в доставке";
    case SystemActionCodes.DELIVERY_COMPLETED:
      return "Доставка выполнена, пожалуйста, подтвердите";
    case SystemActionCodes.DELIVERY_RECEIVED:
      return "Ваша доставка завершена";
    default:
      return "У вас новое сообщение";
  }
};

export const handleSystemMessageByUserType = (
  systemAction: SystemActionCodes,
  userName: string,
  isSender: boolean
) => {
  const messageBlock = getSystemMessageText(systemAction, userName);
  return isSender ? messageBlock?.sender : messageBlock?.receiver;
};

let expo = new Expo();

export const handlePushNotification = (
  notificationTokens: string[],
  sender: string,
  notificationData: TNotificationData,
  messageText?: string
) => {
  let messages: ExpoPushMessage[] = [];
  for (let notificationToken of notificationTokens) {
    if (!Expo.isExpoPushToken(notificationToken)) {
      console.error(
        `Push token ${notificationToken} is not a valid Expo push token`
      );
      continue;
    }
    messages.push({
      to: notificationToken,
      sound: "default",
      title: sender,
      body: messageText,
      data: notificationData,
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets: ExpoPushTicket[] = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();

  let receiptIds: ExpoPushReceiptId[] = [];
  for (let ticket of tickets) {
    if ((ticket as ExpoPushSuccessTicket).id) {
      receiptIds.push((ticket as ExpoPushSuccessTicket).id);
    }
  }

  type detailsError = {
    error?:
      | "DeviceNotRegistered"
      | "InvalidCredentials"
      | "MessageTooBig"
      | "MessageRateExceeded"
      | undefined;
  };

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);

        for (let receiptId in receipts) {
          let { status, details } = receipts[receiptId];
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            if (details) {
              console.error(
                `The error code is ${(details as detailsError)?.error}`
              );
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};
