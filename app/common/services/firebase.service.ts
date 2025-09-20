// import axios from "axios";

// /**
//  * Send a push notification via Expo's push service.
//  *
//  * @param expoPushToken - The Expo push token (e.g. ExponentPushToken[xxxx...])
//  * @param title - Notification title
//  * @param body - Notification body
//  * @param data - Optional extra payload
//  */
// export const sendPushNotification = async (
//   expoPushToken: string,
//   title: string,
//   body: string,
//   data?: Record<string, string>
// ) => {
//   try {
//     const message = {
//       to: expoPushToken,
//       sound: "default",
//       title,
//       body,
//       data,
//     };
//     await axios.post("https://exp.host/--/api/v2/push/send", message, {
//       headers: {
//         Accept: "application/json",
//         "Accept-Encoding": "gzip, deflate",
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("✅ Push notification sent to", expoPushToken);
//   } catch (error: any) {
//     console.error(
//       "❌ Error sending push notification:",
//       error.response?.data || error.message
//     );
//   }
// };

import axios from "axios";

/**
 * Send push notification via Expo + check receipts after sending.
 *
 * @param expoPushToken - The Expo push token
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Optional payload
 */
export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    };

    // Step 1: Send notification
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      message,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Push API response:", response.data);

    // Step 2: Collect message IDs
    const tickets: string[] = [];
    if (response.data?.data) {
      const results = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];

      for (const result of results) {
        if (result.id) {
          tickets.push(result.id);
        }
      }
    }

    // Step 3: Wait a few seconds before checking receipts
    if (tickets.length > 0) {
      setTimeout(async () => {
        try {
          const receiptRes = await axios.post(
            "https://exp.host/--/api/v2/push/getReceipts",
            { ids: tickets },
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("📩 Push Receipts:", JSON.stringify(receiptRes.data, null, 2));
        } catch (err: any) {
          console.error(
            "❌ Error fetching push receipts:",
            err.response?.data || err.message
          );
        }
      }, 5000); // wait 5s before checking receipts
    }
  } catch (error: any) {
    console.error(
      "❌ Error sending push notification:",
      error.response?.data || error.message
    );
  }
};
