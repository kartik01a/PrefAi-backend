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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionByUserId = exports.handleWebhookEvent = exports.createCheckoutSession = void 0;
const sbuscription_schema_1 = __importDefault(require("./sbuscription.schema"));
const user_schema_1 = __importDefault(require("../user/user.schema"));
const stripeService = __importStar(require("../common/services/stripe.service"));
const createCheckoutSession = (userId, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findById(userId);
    if (!user)
        throw new Error("User not found");
    const customer = yield stripeService.getOrCreateCustomer(user);
    const session = yield stripeService.createCheckoutSession(customer.id, planId, userId);
    return { url: session.url };
});
exports.createCheckoutSession = createCheckoutSession;
const handleWebhookEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
        console.log("session", session);
        console.log("metaData", (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.userId);
        if (!userId) {
            throw new Error("Missing userId in session metadata");
        }
        // If it's a subscription checkout
        if (session.subscription) {
            const subscription = yield stripeService.getSubscription(session.subscription);
            const subscriptionItem = subscription.items.data[0];
            const price = subscriptionItem === null || subscriptionItem === void 0 ? void 0 : subscriptionItem.price;
            if (!(price === null || price === void 0 ? void 0 : price.id)) {
                throw new Error("Missing price ID in subscription data");
            }
            const subWithPeriod = subscription;
            yield sbuscription_schema_1.default.create({
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
            // One-time payment handling (no subscription)
            console.log("One-time payment completed for user:", userId);
            // Store order or payment details in DB here
        }
    }
});
exports.handleWebhookEvent = handleWebhookEvent;
const getSubscriptionByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield sbuscription_schema_1.default.findOne({ userId });
});
exports.getSubscriptionByUserId = getSubscriptionByUserId;
//# sourceMappingURL=subscription.service.js.map