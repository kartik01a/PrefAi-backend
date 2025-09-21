// fcm.service.ts
import admin from "firebase-admin";

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return; // Already initialized
  }

  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  if (!credentialsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.");
  }

  try {
    const serviceAccount = JSON.parse(credentialsJson);
    
    // Fix the private key formatting issue
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin SDK:", error);
  }
}

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

/**
 * Send FCM notification to a single device token
 */
export async function sendFcmNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string> {
  if (!fcmToken) {
    throw new Error("FCM token is required");
  }

  if (!title || !body) {
    throw new Error("Title and body are required for FCM notification");
  }

  const message: admin.messaging.Message = {
    token: fcmToken,
    notification: { 
      title: title.trim(), 
      body: body.trim() 
    },
    data: data ?? {},
    android: {
      priority: "high",
      notification: {
        sound: "default",
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          contentAvailable: true,
          category: "MESSAGE",
        },
      },
    },
  };

  try {
    console.log("message", message);
    console.log("fatt gya")
    const response = await admin.messaging().send(message);
    console.log("mein chal gya");
    console.log("✅ FCM notification sent successfully:", {
      messageId: response,
      token: fcmToken.substring(0, 20) + "...", // Log partial token for security
      title,
    });
    return response;
  } catch (error: any) {
    console.error("❌ FCM notification failed:", {
      error: error.message,
      code: error.code,
      token: fcmToken.substring(0, 20) + "...",
      title,
    });
    console.log("error", error);
    
    // Handle specific FCM error codes
    if (error.code === 'messaging/registration-token-not-registered') {
      throw new Error('FCM token is no longer valid. Please refresh the token.');
    } else if (error.code === 'messaging/invalid-registration-token') {
      throw new Error('Invalid FCM token format.');
    } else if (error.code === 'messaging/mismatched-credential') {
      throw new Error('FCM credentials mismatch.');
    }
    
    throw error;
  }
}


export function isValidFcmToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // FCM tokens are typically 152+ characters long and contain alphanumeric characters, hyphens, and underscores
  return token.length >= 140 && /^[a-zA-Z0-9_-]+$/.test(token);
}


