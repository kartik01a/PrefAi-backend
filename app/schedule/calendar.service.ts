import CalendarSchema from "./calendar.schema";
import { ICalendarEvent } from "./calendar.dto";
import { Types } from "mongoose";
import UserSchema from "../user/user.schema";
import { sendPushNotification } from "../common/services/firebase.service";

// export const createEvent = async (data: Omit<ICalendarEvent, "_id" | "createdAt" | "updatedAt">) => {
//   const event = await CalendarSchema.create(data);

//   console.log("userData, with the scheduleData", data);
//   // Fetch user to get FCM token
//   const user = await UserSchema.findById(event.userId);
//   if (user?.fcmToken) {
//     // Calculate notification time (30 min before start)
//     const eventStart = new Date(event.startDate);
//     const eventTime = new Date(eventStart);
//     const [hours, minutes] = event.startTime.split(":").map(Number);
//     eventTime.setHours(hours, minutes, 0, 0);

//     const notifyAt = new Date(eventTime.getTime() - 30 * 60 * 1000); // 30 min before

//     const delay = notifyAt.getTime() - Date.now();
//     if (delay > 0) {
//       setTimeout(() => {
//         sendPushNotification(
//           user.fcmToken!,
//           "Upcoming Event Reminder",
//           `Your event "${event.title}" starts in 30 minutes.`,
//           { eventId: event._id.toString() }
//         );
//       }, delay);
//     }
//   }

//   return event;
// };

export const createEvent = async (data: Omit<ICalendarEvent, "_id" | "createdAt" | "updatedAt">) => {
  const event = await CalendarSchema.create(data);

  const user = await UserSchema.findById(event.userId);
  if (user?.fcmToken) {
    const eventStart = new Date(event.startDate);
    const [hours, minutes] = event.startTime.split(":").map(Number);
    eventStart.setHours(hours, minutes, 0, 0);

    const notifyAt = new Date(eventStart.getTime() - 30 * 60 * 1000);
    const delay = notifyAt.getTime() - Date.now();

    if (delay > 0) {
      console.log(`⏳ Scheduling notification in ${delay / 1000}s`);

      setTimeout(() => {
        sendPushNotification(
          user.fcmToken!,
          "Upcoming Event Reminder",
          `Your event "${event.title}" starts in 30 minutes.`,
          { eventId: event._id.toString() }
        );
      }, delay);
    } else {
      console.log("⚠️ Event already within 30 minutes, sending immediately");
      sendPushNotification(
        user.fcmToken!,
        "Upcoming Event Reminder",
        `Your event "${event.title}" starts soon.`,
        { eventId: event._id.toString() }
      );
    }
  }

  return event;
};


export const updateEvent = async (id: string, data: Partial<ICalendarEvent>) => {
  return await CalendarSchema.findByIdAndUpdate(id, data, { new: true });
};

export const deleteEvent = async (id: string) => {
  return await CalendarSchema.findByIdAndDelete(id);
};

export const getEventsByUser = async (userId: string | Types.ObjectId) => {
  return await CalendarSchema.find({ userId: new Types.ObjectId(userId) });
};