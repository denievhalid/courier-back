import {
  Expo,
  ExpoPushMessage,
  ExpoPushReceiptId,
  ExpoPushSuccessTicket,
  ExpoPushTicket,
} from "expo-server-sdk";

let expo = new Expo({});

export const handlePushNotification = (notificationTokens: string[]) => {
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
      body: "This is a test notification",
      data: { withSome: "data" },
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets: ExpoPushTicket[] = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
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
        console.log(receipts);

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
