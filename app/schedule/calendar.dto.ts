import { type BaseSchema } from "../common/dto/base.dto";
import { Types } from "mongoose";

export interface ICalendarEvent extends BaseSchema {
  title: string;
  startDate: number;
  endDate: number;
  startTime: string;
  endTime: string;
  userId: Types.ObjectId; 
}
