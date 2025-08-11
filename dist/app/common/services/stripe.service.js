"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructWebhookEvent = exports.getSubscription = exports.createCheckoutSession = exports.getOrCreateCustomer = void 0;
const __1 = require("../../../");
const getOrCreateCustomer = async (user) => {
    if (!user.stripeCustomerId) {
        const customer = await __1.stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        });
        user.stripeCustomerId = customer.id;
        await user.save();
        return customer;
    }
    return (await __1.stripe.customers.retrieve(user.stripeCustomerId));
};
exports.getOrCreateCustomer = getOrCreateCustomer;
const createCheckoutSession = async (customerId, planId, userId) => {
    const session = await __1.stripe.checkout.sessions.create({
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
        success_url: `prefai://success`,
        cancel_url: `prefai://cancel`,
    });
    return session;
};
exports.createCheckoutSession = createCheckoutSession;
const getSubscription = async (subscriptionId) => {
    if (!subscriptionId) {
        throw new Error("No subscription ID provided to getSubscription");
    }
    return await __1.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price"],
    });
};
exports.getSubscription = getSubscription;
const constructWebhookEvent = (payload, sig) => {
    const webhookSecret = __1.endpointSecret;
    if (!webhookSecret)
        throw new Error("Stripe webhook secret not set");
    return __1.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
};
exports.constructWebhookEvent = constructWebhookEvent;
