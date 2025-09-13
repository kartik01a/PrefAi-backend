import mongoose, { Types } from "mongoose";
import { ICalendarEvent } from "./calendar.dto";

const Schema = mongoose.Schema;

const CalendarSchema = new Schema<ICalendarEvent>(
  {
    title: { type: String, required: true },
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICalendarEvent>("calendar", CalendarSchema);
