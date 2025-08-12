import Stripe from "stripe";
import { IUser } from "../../user/user.dto";
import { endpointSecret, stripe } from "../../..";

export const getOrCreateCustomer = async (
  user: IUser
): Promise<Stripe.Customer> => {
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
    user.stripeCustomerId = customer.id;
    await user.save();
    return customer;
  }
  return (await stripe.customers.retrieve(
    user.stripeCustomerId
  )) as Stripe.Customer;
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
    cancel_url: `prefai://cancel`,
  });

  return session;
};
export const getSubscription = async (
  subscriptionId: string | null | undefined
): Promise<Stripe.Subscription> => {
  if (!subscriptionId) {
    throw new Error("No subscription ID provided to getSubscription");
  }
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });
};

export const constructWebhookEvent = (
  payload: Buffer | string,
  sig: string | string[]
): Stripe.Event => {
  const webhookSecret = endpointSecret;
  if (!webhookSecret) throw new Error("Stripe webhook secret not set");

  return stripe.webhooks.constructEvent(payload, sig, webhookSecret);
};
