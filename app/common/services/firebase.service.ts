import { google } from "googleapis";
import axios from "axios";

/**
 * Send a push notification via Expo's push service.
 *
 * @param expoPushToken - The Expo push token (e.g. ExponentPushToken[xxxx...])
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Optional extra payload
 */

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

async function getAccessToken() {
  const client = new google.auth.JWT({
    email: process.env.FCM_CLIENT_EMAIL,
    key: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });
  
  const credentials = await client.authorize();
  return credentials.access_token;
}

export async function sendPushNotification(
  fcmToken: string, 
  title: string, 
  body: string, 
  data?: Record<string, any>
) {
  try {
    const accessToken = await getAccessToken();
    
    const response = await axios.post(
      `https://fcm.googleapis.com/v1/projects/${process.env.FCM_PROJECT_ID}/messages:send`,
      {
        message: {
          token: fcmToken,
          notification: {
            title,
            body,
          },
          data: data || {},
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log("FCM Response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error sending push notification:", err);
    throw err;
  }
}