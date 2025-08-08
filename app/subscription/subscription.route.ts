import { Router } from "express";
import express from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import * as subscriptionController from "./subscription.controller";
import {
  createCheckoutSessionValidator,
} from "./subscription-validation";

const router = Router();

// Create Stripe checkout session
router.post(
  "/checkout-session",
  roleAuth(["USER"]),
  createCheckoutSessionValidator,
  catchError,
  subscriptionController.createCheckoutSession
);

// Webhook from Stripe (raw body needed)


// Get logged-in user's subscription
router.get(
  "/me",
  roleAuth(["USER"]),
  catchError,
  subscriptionController.getMySubscription
);

export default router;
