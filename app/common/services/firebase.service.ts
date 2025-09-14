import axios from "axios";

/**
 * Send a push notification via Expo's push service.
 * 
 * @param expoPushToken - The Expo push token (e.g. ExponentPushToken[xxxx...])
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Optional extra payload
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

    await axios.post("https://exp.host/--/api/v2/push/send", message, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Push notification sent to", expoPushToken);
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
  }
};
