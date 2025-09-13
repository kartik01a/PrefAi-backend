import { Router } from "express";
import * as calendarController from "./calendar.controller";

const router = Router();

router.post("/", calendarController.createEvent);
router.put("/:id", calendarController.updateEvent);
router.delete("/:id", calendarController.deleteEvent);
router.get("/user/:userId", calendarController.getUserEvents);

export default router;
