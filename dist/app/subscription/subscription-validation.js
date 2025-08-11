"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSessionValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createCheckoutSessionValidator = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)("planId")
        .notEmpty()
        .withMessage("Plan ID is required")
        .isString()
        .withMessage("Plan ID must be a string"),
]);
