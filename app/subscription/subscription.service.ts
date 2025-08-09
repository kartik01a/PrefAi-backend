import SubscriptionSchema, { ISubscription } from "./sbuscription.schema";
import UserSchema from "../user/user.schema";
import * as stripeService from "../common/services/stripe.service";
import Stripe from "stripe";

export const createCheckoutSession = async (userId: string, planId: string) => {
  const user = await UserSchema.findById(userId);
  if (!user) throw new Error("User not found");
  const customer = await stripeService.getOrCreateCustomer(user);
  const session = await stripeService.createCheckoutSession(customer.id, planId, userId);
  return { url: session.url };
};

export const handleWebhookEvent = async (event: Stripe.Event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    console.log("session", session)
    console.log("metaData", session.metadata?.userId);
    if (!userId) {
      throw new Error("Missing userId in session metadata");
    }

    // If it's a subscription checkout
    if (session.subscription) {
      const subscription = await stripeService.getSubscription(
        session.subscription as string
      );

      const subscriptionItem = subscription.items.data[0];
      const price = subscriptionItem?.price;

      if (!price?.id) {
        throw new Error("Missing price ID in subscription data");
      }

      const subWithPeriod = subscription as Stripe.Subscription & {
        current_period_start: number;
        current_period_end: number;
        cancel_at_period_end: boolean;
        canceled_at?: number | null;
      };

      await SubscriptionSchema.create({
        userId,
        stripeCustomerId: subWithPeriod.customer as string,
        stripeSubscriptionId: subWithPeriod.id,
        planId: price.id,
        status: subWithPeriod.status,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: subWithPeriod.cancel_at_period_end,
        canceledAt: subWithPeriod.canceled_at
          ? new Date(subWithPeriod.canceled_at * 1000)
          : undefined,
      });
    } else {
      // One-time payment handling (no subscription)
      console.log("One-time payment completed for user:", userId);
      // Store order or payment details in DB here
    }
  }
};


export const getSubscriptionByUserId = async (userId: string): Promise<ISubscription | null> => {
  return await SubscriptionSchema.findOne({ userId });
};
