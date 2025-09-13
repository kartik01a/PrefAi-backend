import { body, checkExact } from "express-validator";

export const createEventValidator = checkExact([
  body("title").notEmpty().withMessage("Title is required"),
  body("startDate").isNumeric().withMessage("startDate must be a timestamp"),
  body("endDate").isNumeric().withMessage("endDate must be a timestamp"),
  body("startTime").isString().withMessage("startTime is required"),
  body("endTime").isString().withMessage("endTime is required"),
  body("userId").notEmpty().withMessage("userId is required"),
]);
