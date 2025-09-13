import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.hepler";
import * as calendarService from "./calendar.service";

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await calendarService.createEvent(req.body);
  res.send(createResponse(event, "Event created successfully"));
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await calendarService.updateEvent(req.params.id, req.body);
  res.send(createResponse(event, "Event updated successfully"));
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await calendarService.deleteEvent(req.params.id);
  res.send(createResponse(null, "Event deleted successfully"));
});

export const getUserEvents = asyncHandler(async (req: Request, res: Response) => {
  const events = await calendarService.getEventsByUser(req.params.userId);
  res.send(createResponse(events, "Events fetched successfully"));
});
