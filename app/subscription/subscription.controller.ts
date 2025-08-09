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

// Simple in-memory cache for processed event IDs to avoid duplicate processing
const processedEvents = new Set<string>();
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  console.log("Webhook received:", req.headers["stripe-signature"]);
  console.log("Raw body is Buffer:", Buffer.isBuffer(req.body));
  const sig = req.headers["stripe-signature"] as string;
  const payload = req.body as Buffer;
  let event;
  try {
    event = stripeService.constructWebhookEvent(payload, sig);
    console.log("✅ Event constructed:", event.type);
    console.log("Event data:", JSON.stringify(event.data.object, null, 2));
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (processedEvents.has(event.id)) {
    console.log(`⚠️ Duplicate event received, ignoring: ${event.id}`);
    return res.status(200).json({ received: true });
  }
  processedEvents.add(event.id);
  try {
    await subscriptionService.handleWebhookEvent(event);
    console.log("✅ Webhook processed successfully");
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("❌ Error processing webhook event:", err);
    return res.status(500).send(`Webhook handler failed: ${err.message || err}`);
  }
};

