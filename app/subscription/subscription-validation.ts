import { body, checkExact } from "express-validator";

export const createCheckoutSessionValidator = checkExact([
  body("planId")
    .notEmpty()
    .withMessage("Plan ID is required")
    .isString()
    .withMessage("Plan ID must be a string"),
]);