import admin from "firebase-admin";
import path from "path";

// Load Firebase service account (download JSON from Firebase Console)
// const serviceAccountPath = path.join(__dirname, "../../../firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert("serviceAccountPath"),
  });
}

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message = {
      notification: { title, body },
      token,
      data,
    };
    await admin.messaging().send(message);
    console.log("✅ Push notification sent");
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
  }
};
