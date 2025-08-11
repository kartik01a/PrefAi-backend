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
exports.stripeWebhookHandler = exports.getMySubscription = exports.createCheckoutSession = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const response_hepler_1 = require("../common/helper/response.hepler");
const subscriptionService = __importStar(require("./subscription.service"));
const stripeService = __importStar(require("../common/services/stripe.service"));
exports.createCheckoutSession = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user?._id;
    const { planId } = req.body;
    const session = await subscriptionService.createCheckoutSession(userId || "", planId);
    res.status(200).json((0, response_hepler_1.createResponse)(session, "Checkout session created successfully"));
});
exports.getMySubscription = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user?._id;
    const subscription = await subscriptionService.getSubscriptionByUserId(userId || "");
    res.status(200).json((0, response_hepler_1.createResponse)(subscription, "User subscription fetched successfully"));
});
const processedEvents = new Set();
const stripeWebhookHandler = async (req, res) => {
    console.log("Webhook received:", req.headers["stripe-signature"]);
    console.log("Raw body is Buffer:", Buffer.isBuffer(req.body));
    const sig = req.headers["stripe-signature"];
    const payload = req.body;
    let event;
    try {
        event = stripeService.constructWebhookEvent(payload, sig);
        console.log("✅ Event constructed:", event.type);
        console.log("Event data:", JSON.stringify(event.data.object, null, 2));
    }
    catch (err) {
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
    }
    catch (err) {
        console.error("❌ Error processing webhook event:", err);
        return res.status(500).send(`Webhook handler failed: ${err.message || err}`);
    }
};
exports.stripeWebhookHandler = stripeWebhookHandler;
