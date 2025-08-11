"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./user/user.route"));
const document_route_1 = __importDefault(require("./document/document.route"));
const subscription_route_1 = __importDefault(require("./subscription/subscription.route"));
const router = express_1.default.Router();
router.use("/users", user_route_1.default);
router.use("/documents", document_route_1.default);
router.use('/subscription', subscription_route_1.default);
exports.default = router;
