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

    const subscription = await stripeService.getSubscription(session.subscription as string);

    const userId = session.metadata?.userId;
    const subscriptionItem = subscription.items.data[0];
    const price = subscriptionItem?.price;

    if (!userId || typeof price !== "object" || !("id" in price)) {
      throw new Error("Invalid Stripe subscription data");
    }

    // Manually assert the extended fields
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
      currentPeriodStart: new Date(subWithPeriod.current_period_start * 1000),
      currentPeriodEnd: new Date(subWithPeriod.current_period_end * 1000),
      cancelAtPeriodEnd: subWithPeriod.cancel_at_period_end,
      canceledAt: subWithPeriod.canceled_at
        ? new Date(subWithPeriod.canceled_at * 1000)
        : undefined,
    });
  }
};



export const getSubscriptionByUserId = async (userId: string): Promise<ISubscription | null> => {
  return await SubscriptionSchema.findOne({ userId });
};
