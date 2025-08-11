"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionByUserId = exports.handleWebhookEvent = exports.createCheckoutSession = void 0;
const sbuscription_schema_1 = __importDefault(require("./sbuscription.schema"));
const user_schema_1 = __importDefault(require("../user/user.schema"));
const stripeService = __importStar(require("../common/services/stripe.service"));
const createCheckoutSession = async (userId, planId) => {
    const user = await user_schema_1.default.findById(userId);
    if (!user)
        throw new Error("User not found");
    const customer = await stripeService.getOrCreateCustomer(user);
    const session = await stripeService.createCheckoutSession(customer.id, planId, userId);
    return { url: session.url };
};
exports.createCheckoutSession = createCheckoutSession;
const handleWebhookEvent = async (event) => {
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        console.log("session", session);
        console.log("metaData", session.metadata?.userId);
        if (!userId) {
            throw new Error("Missing userId in session metadata");
        }
        if (session.subscription) {
            const subscription = await stripeService.getSubscription(session.subscription);
            const subscriptionItem = subscription.items.data[0];
            const price = subscriptionItem?.price;
            if (!price?.id) {
                throw new Error("Missing price ID in subscription data");
            }
            const subWithPeriod = subscription;
            await sbuscription_schema_1.default.create({
                userId,
                stripeCustomerId: subWithPeriod.customer,
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
        }
        else {
            console.log("One-time payment completed for user:", userId);
        }
    }
};
exports.handleWebhookEvent = handleWebhookEvent;
const getSubscriptionByUserId = async (userId) => {
    return await sbuscription_schema_1.default.findOne({ userId });
};
exports.getSubscriptionByUserId = getSubscriptionByUserId;
