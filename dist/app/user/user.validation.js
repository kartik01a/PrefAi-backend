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
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialLogin = exports.refreshToken = exports.editUser = exports.updateUserLanguage = exports.updateUser = exports.createUser = exports.forgotPassword = exports.verifyEmail = exports.changePassword = exports.verifyInvitation = exports.login = void 0;
const express_validator_1 = require("express-validator");
const user_dto_1 = require("./user.dto");
const userService = __importStar(require("./user.service"));
exports.login = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email must be valid"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string"),
]);
exports.verifyInvitation = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)("token")
        .notEmpty()
        .bail()
        .withMessage("Token is required")
        .isString()
        .bail()
        .withMessage("Token must be string"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string"),
    (0, express_validator_1.body)("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password");
        }
        return true;
    }),
]);
exports.changePassword = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)("currentPassword").custom((value_1, _a) => __awaiter(void 0, [value_1, _a], void 0, function* (value, { req }) {
        const user = yield userService.getUserById(req.user._id, {
            provider: true,
        });
        if ((user === null || user === void 0 ? void 0 : user.provider) === user_dto_1.ProviderType.MANUAL && !value)
            throw new Error("Current password is required.");
        return true;
    })),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string"),
    (0, express_validator_1.body)("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password");
        }
        return true;
    }),
]);
exports.verifyEmail = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email must be valid")
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userService.getUserByEmail(value);
        if (user)
            throw new Error("Email is already exist.");
        return true;
    })),
]);
exports.forgotPassword = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email must be valid")
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userService.getUserByEmail(value);
        if (!user) {
            throw new Error("User not found!");
        }
        if (user.provider !== user_dto_1.ProviderType.MANUAL)
            throw new Error(`Please login with ${user_dto_1.ProviderType.MANUAL}`);
        return true;
    })),
]);
exports.createUser = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .isString()
        .withMessage("First name must be a string"),
    (0, express_validator_1.body)("lastName")
        .notEmpty()
        .withMessage("Last name is required")
        .isString()
        .withMessage("Last name must be a string"),
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email must be valid")
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userService.getUserByEmail(value);
        if (user)
            throw new Error("Email already exists.");
        return true;
    })),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string"),
    (0, express_validator_1.body)("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password");
        }
        return true;
    }),
    (0, express_validator_1.body)("passportNumber")
        .notEmpty()
        .withMessage("Passport number is required")
        .isString()
        .withMessage("Passport number must be a string"),
    (0, express_validator_1.body)("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["USER", "ADMIN"])
        .withMessage("Role must be either USER or ADMIN"),
    (0, express_validator_1.body)("provider")
        .notEmpty()
        .withMessage("Provider is required")
        .isIn(Object.values(user_dto_1.ProviderType))
        .withMessage(`Provider must be one of: ${Object.values(user_dto_1.ProviderType).join(", ")}`)
]);
exports.updateUser = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("name is required")
        .isString()
        .withMessage("name must be a string"),
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("email is required")
        .isString()
        .withMessage("email must be a string"),
    (0, express_validator_1.body)("active").isBoolean().withMessage("active must be a boolean"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("password is required")
        .isString()
        .withMessage("password must be a string"),
];
exports.updateUserLanguage = [
    (0, express_validator_1.body)("language")
        .notEmpty()
        .withMessage("language is required")
        .isString()
        .withMessage("language must be a string"),
];
exports.editUser = [
    (0, express_validator_1.body)("name").isString().withMessage("name must be a string"),
    (0, express_validator_1.body)("email").isString().withMessage("email must be a string"),
    (0, express_validator_1.body)("active").isBoolean().withMessage("active must be a boolean"),
    (0, express_validator_1.body)("password").isString().withMessage("password must be a string"),
];
exports.refreshToken = [
    (0, express_validator_1.body)("refreshToken")
        .notEmpty()
        .bail()
        .withMessage("Refresh token is required")
        .isString()
        .bail()
        .withMessage("refreshToken must be string"),
];
const socialLogin = (name) => [
    (0, express_validator_1.body)(name)
        .notEmpty()
        .bail()
        .withMessage(`${name} is required`)
        .isString()
        .bail()
        .withMessage(`${name} must be string`),
];
exports.socialLogin = socialLogin;
//# sourceMappingURL=user.validation.js.map