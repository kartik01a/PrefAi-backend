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
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const cath_error_middleware_1 = require("../common/middleware/cath-error.middleware");
const role_auth_middleware_1 = require("../common/middleware/role-auth.middleware");
const userController = __importStar(require("./user.controller"));
const userValidator = __importStar(require("./user.validation"));
const router = (0, express_1.Router)();
router
    .get("/", userController.getAllUser)
    .get("/me", (0, role_auth_middleware_1.roleAuth)(["USER"]), userController.getUserInfo)
    .get("/:id", userController.getUserById)
    .delete("/:id", userController.deleteUser)
    .post("/", userValidator.createUser, cath_error_middleware_1.catchError, userController.createUser)
    .patch("/language/:id", userValidator.updateUserLanguage, cath_error_middleware_1.catchError, userController.updateUserData)
    .put("/:id", cath_error_middleware_1.catchError, userController.updateUser)
    .patch("/:id", userValidator.editUser, cath_error_middleware_1.catchError, userController.editUser)
    .post("/register", userValidator.createUser, cath_error_middleware_1.catchError, userController.createUser)
    .post("/invite", userValidator.verifyEmail, cath_error_middleware_1.catchError, userController.inviteUser)
    .post("/verify-invitation", userValidator.verifyInvitation, cath_error_middleware_1.catchError, userController.verifyInvitation)
    .post("/reset-password", userValidator.verifyInvitation, cath_error_middleware_1.catchError, userController.resetPassword)
    .post("/forgot-password", userValidator.forgotPassword, cath_error_middleware_1.catchError, userController.requestResetPassword)
    .post("/change-password", (0, role_auth_middleware_1.roleAuth)(["USER"]), userValidator.changePassword, cath_error_middleware_1.catchError, userController.changePassword)
    .post("/login", userValidator.login, cath_error_middleware_1.catchError, passport_1.default.authenticate("login", { session: false }), userController.login)
    .post("/refresh-token", userValidator.refreshToken, cath_error_middleware_1.catchError, userController.refreshToken)
    .post("/logout", (0, role_auth_middleware_1.roleAuth)(["USER"]), userController.logout);
exports.default = router;
