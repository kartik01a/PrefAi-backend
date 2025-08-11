"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleAuth = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const process_1 = __importDefault(require("process"));
const roleAuth = (roles, publicRoutes = []) => (0, express_async_handler_1.default)(async (req, res, next) => {
    if (publicRoutes.includes(req.path)) {
        next();
        return;
    }
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        throw (0, http_errors_1.default)(401, {
            message: `Invalid token`,
        });
    }
    try {
        const decodedUser = jsonwebtoken_1.default.verify(token, process_1.default.env.JWT_SECRET);
        req.user = decodedUser;
    }
    catch (error) {
        if (error.message === "jwt expired") {
            throw (0, http_errors_1.default)(401, {
                message: `Token expired`,
                data: {
                    type: "TOKEN_EXPIRED",
                },
            });
        }
        throw (0, http_errors_1.default)(400, {
            message: error.message,
        });
    }
    const user = req.user;
    if (!roles.includes(user.role)) {
        let type;
        if (user.role != undefined) {
            type =
                user.role.slice(0, 1) + user.role.slice(1).toLocaleLowerCase();
        }
        throw (0, http_errors_1.default)(401, {
            message: `${type} can not access this resource`,
        });
    }
    next();
});
exports.roleAuth = roleAuth;
