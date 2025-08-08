import Stripe from "stripe";
import { IUser } from "../../user/user.dto";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

export const getOrCreateCustomer = async (user: IUser): Promise<Stripe.Customer> => {
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
    user.stripeCustomerId = customer.id;
    await user.save();
    return customer;
  }
  return await stripe.customers.retrieve(user.stripeCustomerId) as Stripe.Customer;
};

export const createCheckoutSession = async (
  customerId: string,
  planId: string,
  userId: string
): Promise<Stripe.Checkout.Session> => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
    success_url: `prefai://document`,
    cancel_url: `prefai://payment-cancelled`,
  });

  return session;
};
export const getSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'], // this ensures price is a full object
  });
};

export const constructWebhookEvent = (
  payload: Buffer | string,
  sig: string | string[]
): Stripe.Event => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Stripe webhook secret not set");

  return stripe.webhooks.constructEvent(payload, sig, webhookSecret);
};