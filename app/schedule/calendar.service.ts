import CalendarSchema from "./calendar.schema";
import { ICalendarEvent } from "./calendar.dto";
import { Types } from "mongoose";
import UserSchema from "../user/user.schema";
import { sendPushNotification } from "../common/services/firebase.service";

export const createEvent = async (
  data: Omit<ICalendarEvent, "_id" | "createdAt" | "updatedAt">
) => {
  const event = await CalendarSchema.create(data);
  const user = await UserSchema.findById(event.userId);
  if (!user?.fcmToken) return event;
  const eventStart = new Date(event.startDate);
  const [hours, minutes] = event.startTime.split(":").map(Number);
  eventStart.setHours(hours, minutes, 0, 0);
  const notifyAt = new Date(eventStart.getTime() - 30 * 60 * 1000);
  const delay = notifyAt.getTime() - Date.now();
  console.log("user.fcmToken", user.fcmToken);
        sendPushNotification(
        user.fcmToken!,
        "Upcoming Event Reminder",
        `Your event "${event.title}" starts in 30 minutes.`,
        { eventId: event._id.toString() }
      );
  // if (delay > 0) {
  //   console.log(`⏳ Scheduling notification in ${delay / 1000}s`);
  //   setTimeout(() => {
  //     sendPushNotification(
  //       user.fcmToken!,
  //       "Upcoming Event Reminder",
  //       `Your event "${event.title}" starts in 30 minutes.`,
  //       { eventId: event._id.toString() }
  //     );
  //   }, delay);
  // } else {
  //   console.log("⚠️ Event already within 30 minutes, sending immediately");
  //   sendPushNotification(
  //     user.fcmToken!,
  //     "Upcoming Event Reminder",
  //     `Your event "${event.title}" starts soon.`,
  //     { eventId: event._id.toString() }
  //   );
  // }
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