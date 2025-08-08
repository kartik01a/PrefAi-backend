import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.hepler";
import * as subscriptionService from "./subscription.service";
import * as stripeService from "../common/services/stripe.service";

export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { planId } = req.body;

  const session = await subscriptionService.createCheckoutSession(userId || "", planId);

  res.status(200).json(createResponse(session, "Checkout session created successfully"));
});

export const getMySubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const subscription = await subscriptionService.getSubscriptionByUserId(userId || "");

  res.status(200).json(createResponse(subscription, "User subscription fetched successfully"));
});

export const stripeWebhookHandler = (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"]!;
  const body = req.body;

  let event;
  try {
    event = stripeService.constructWebhookEvent(body, sig);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  subscriptionService.handleWebhookEvent(event)
    .then(() => res.json({ received: true }))
    .catch((err) => {
      console.error("Error processing webhook event:", err);
      res.status(500).send("Webhook handler failed");
    });
};
