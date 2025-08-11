"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructWebhookEvent = exports.getSubscription = exports.createCheckoutSession = exports.getOrCreateCustomer = void 0;
const __1 = require("../../..");
const getOrCreateCustomer = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user.stripeCustomerId) {
        const customer = yield __1.stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        });
        user.stripeCustomerId = customer.id;
        yield user.save();
        return customer;
    }
    return yield __1.stripe.customers.retrieve(user.stripeCustomerId);
});
exports.getOrCreateCustomer = getOrCreateCustomer;
const createCheckoutSession = (customerId, planId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield __1.stripe.checkout.sessions.create({
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
});
exports.createCheckoutSession = createCheckoutSession;
const getSubscription = (subscriptionId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!subscriptionId) {
        throw new Error("No subscription ID provided to getSubscription");
    }
    return yield __1.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price"],
    });
});
exports.getSubscription = getSubscription;
const constructWebhookEvent = (payload, sig) => {
    const webhookSecret = __1.endpointSecret;
    if (!webhookSecret)
        throw new Error("Stripe webhook secret not set");
    return __1.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
};
exports.constructWebhookEvent = constructWebhookEvent;
//# sourceMappingURL=stripe.service.js.map