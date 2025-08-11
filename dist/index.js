"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpointSecret = exports.stripe = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const morgan_1 = __importDefault(require("morgan"));
const config_hepler_1 = require("./app/common/helper/config.hepler");
(0, config_hepler_1.loadConfig)();
const error_handler_middleware_1 = __importDefault(require("./app/common/middleware/error-handler.middleware"));
const database_service_1 = require("./app/common/services/database.service");
const passport_jwt_service_1 = require("./app/common/services/passport-jwt.service");
const routes_1 = __importDefault(require("./app/routes"));
const subscription_controller_1 = require("./app/subscription/subscription.controller");
const stripe_1 = __importDefault(require("stripe"));
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
});
exports.endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const port = Number(process.env.PORT) ?? 5000;
const app = (0, express_1.default)();
app.post("/webhook", express_1.default.raw({ type: "application/json" }), subscription_controller_1.stripeWebhookHandler);
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
const initApp = async () => {
    await (0, database_service_1.initDB)();
    (0, passport_jwt_service_1.initPassport)();
    app.use("/api", routes_1.default);
    app.get("/", (req, res) => {
        res.send({ status: "ok" });
    });
    app.use(error_handler_middleware_1.default);
    http_1.default.createServer(app).listen(port, () => {
        console.log("Server is runnuing on port", port);
    });
};
void initApp();
