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
exports.refreshToken = exports.logout = exports.getUserInfo = exports.login = exports.getAllUser = exports.getUserById = exports.deleteUser = exports.editUser = exports.updateUser = exports.requestResetPassword = exports.changePassword = exports.resetPassword = exports.verifyInvitation = exports.inviteUser = exports.updateUserData = exports.createUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_errors_1 = __importDefault(require("http-errors"));
const response_hepler_1 = require("../common/helper/response.hepler");
const email_service_1 = require("../common/services/email.service");
const passport_jwt_service_1 = require("../common/services/passport-jwt.service");
const user_dto_1 = require("./user.dto");
const user_schema_1 = require("./user.schema");
const userService = __importStar(require("./user.service"));
exports.createUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.createUser(req.body);
    res.send((0, response_hepler_1.createResponse)(result, "User created sucssefully"));
}));
exports.updateUserData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.updateUserData(req.params.id, req.body);
    res.send((0, response_hepler_1.createResponse)(result, "UserInfo updated sucssefully"));
}));
exports.inviteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.createUser(Object.assign(Object.assign({}, req.body), { role: "USER", active: false }));
    const { email } = req.body;
    const { refreshToken } = (0, passport_jwt_service_1.createUserTokens)(result);
    yield userService.editUser(result._id, { refreshToken });
    const url = `${process.env.FE_BASE_URL}/reset-password?code=${refreshToken}&type=invite`;
    console.log(url);
    (0, email_service_1.sendEmail)({
        to: email,
        subject: "Welcone to <app>",
        html: `<body to create profile> ${url}`,
    });
    res.send((0, response_hepler_1.createResponse)(result, "User invited sucssefully"));
}));
exports.verifyInvitation = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    const { email, expired } = (0, passport_jwt_service_1.decodeToken)(token);
    const user = yield userService.getUserByEmail(email, {
        refreshToken: true,
        active: true,
    });
    if (!user || expired || token !== user.refreshToken) {
        throw (0, http_errors_1.default)(400, { message: "Invitation is expired" });
    }
    if (user === null || user === void 0 ? void 0 : user.active) {
        throw (0, http_errors_1.default)(400, {
            message: "Invitation is accepeted, Please login",
        });
    }
    if (user === null || user === void 0 ? void 0 : user.blocked) {
        throw (0, http_errors_1.default)(400, { message: "User is blocked" });
    }
    const tokens = yield (0, passport_jwt_service_1.createUserTokens)(user);
    yield userService.editUser(user._id, {
        password: yield (0, user_schema_1.hashPassword)(password),
        active: true,
        refreshToken: tokens.refreshToken,
    });
    res.send((0, response_hepler_1.createResponse)(tokens, "User verified sucssefully"));
}));
exports.resetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    const { email, expired } = (0, passport_jwt_service_1.decodeToken)(token);
    console.log({ email, expired });
    const user = yield userService.getUserByEmail(email, {
        refreshToken: true,
        active: true,
    });
    if (!user || expired || token !== user.refreshToken) {
        throw (0, http_errors_1.default)(400, { message: "Invitation is expired" });
    }
    if (!(user === null || user === void 0 ? void 0 : user.active)) {
        throw (0, http_errors_1.default)(400, {
            message: "User is not active",
        });
    }
    if (user === null || user === void 0 ? void 0 : user.blocked) {
        throw (0, http_errors_1.default)(400, { message: "User is blocked" });
    }
    yield userService.editUser(user._id, {
        password: yield (0, user_schema_1.hashPassword)(password),
        refreshToken: "",
    });
    res.send((0, response_hepler_1.createResponse)(null, "Password updated sucssefully"));
}));
exports.changePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { currentPassword, password } = req.body;
    const user = yield userService.getUserById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, {
        refreshToken: true,
        active: true,
        password: true,
        provider: true,
    });
    if (!user) {
        throw (0, http_errors_1.default)(400, { message: "Invalid user" });
    }
    if (user.provider === user_dto_1.ProviderType.MANUAL) {
        const validPassword = yield (0, passport_jwt_service_1.isValidPassword)(currentPassword, user.password);
        if (!validPassword) {
            throw (0, http_errors_1.default)(400, {
                message: "Current password doesn't matched",
            });
        }
    }
    yield userService.editUser(user._id, {
        password: yield (0, user_schema_1.hashPassword)(password),
        provider: user_dto_1.ProviderType.MANUAL,
    });
    res.send((0, response_hepler_1.createResponse)(null, "Password changed sucssefully"));
}));
exports.requestResetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userService.getUserByEmail(email, {
        active: true,
        blocked: true,
        email: true,
    });
    if (!(user === null || user === void 0 ? void 0 : user.active)) {
        throw (0, http_errors_1.default)(400, {
            message: "User is not active",
        });
    }
    if (user === null || user === void 0 ? void 0 : user.blocked) {
        throw (0, http_errors_1.default)(400, { message: "User is blocked" });
    }
    const tokens = (0, passport_jwt_service_1.createUserTokens)(user);
    yield userService.editUser(user._id, {
        refreshToken: tokens.refreshToken,
    });
    const url = `${process.env.FE_BASE_URL}/reset-password?code=${tokens.refreshToken}&type=reset-password`;
    console.log(url);
    (0, email_service_1.sendEmail)({
        to: email,
        subject: "Reset password",
        html: `<body to create profile> ${url}`,
    });
    res.send((0, response_hepler_1.createResponse)(null, "Reset password link sent to your email."));
}));
exports.updateUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.updateUser(req.params.id, req.body);
    const userInfo = yield userService.getUserById(result === null || result === void 0 ? void 0 : result.id);
    res.send((0, response_hepler_1.createResponse)(userInfo, "User updated sucssefully"));
}));
exports.editUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.editUser(req.params.id, req.body);
    res.send((0, response_hepler_1.createResponse)(result, "User updated sucssefully"));
}));
exports.deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.deleteUser(req.params.id);
    res.send((0, response_hepler_1.createResponse)(result, "User deleted sucssefully"));
}));
exports.getUserById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.getUserById(req.params.id);
    res.send((0, response_hepler_1.createResponse)(result));
}));
exports.getAllUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = req.query.skip ? parseInt(req.query.skip) : undefined;
    const limit = req.query.limit
        ? parseInt(req.query.limit)
        : undefined;
    const result = yield userService.getAllUser({}, { skip, limit });
    if (skip || limit) {
        const count = yield userService.countItems();
        res.send((0, response_hepler_1.createResponse)({
            count,
            users: result,
        }));
        return;
    }
    res.send((0, response_hepler_1.createResponse)(result));
}));
exports.login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokens = (0, passport_jwt_service_1.createUserTokens)(req.user);
    yield userService.editUser(req.user._id, {
        refreshToken: tokens.refreshToken,
    });
    let userInfo = yield userService.getUserById(req.user._id);
    res.send((0, response_hepler_1.createResponse)(Object.assign(Object.assign({}, tokens), { userInfo })));
}));
exports.getUserInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userService.getUserById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    res.send((0, response_hepler_1.createResponse)(user));
}));
exports.logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    yield userService.editUser(user._id, { refreshToken: "" });
    res.send((0, response_hepler_1.createResponse)({ message: "User logout successfully!" }));
}));
exports.refreshToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    const { email } = (0, passport_jwt_service_1.verifyToken)(refreshToken);
    const user = yield userService.getUserByEmail(email, {
        refreshToken: true,
        active: true,
        blocked: true,
        email: true,
        role: true,
    });
    if (!user || refreshToken !== user.refreshToken) {
        throw (0, http_errors_1.default)({ message: "Invalid session" });
    }
    if (!(user === null || user === void 0 ? void 0 : user.active)) {
        throw (0, http_errors_1.default)({ message: "User is not active" });
    }
    if (user === null || user === void 0 ? void 0 : user.blocked) {
        throw (0, http_errors_1.default)({ message: "User is blocked" });
    }
    delete user.refreshToken;
    const tokens = (0, passport_jwt_service_1.createUserTokens)(user);
    yield userService.editUser(user._id, {
        refreshToken: tokens.refreshToken,
    });
    res.send((0, response_hepler_1.createResponse)(tokens));
}));
// export const appleLogin = asyncHandler(async (req: Request, res: Response) => {
//   if (!process.env.APPLE_BUNDLE_ID) {
//     throw createHttpError({ message: "Apple bundle id not configured!" });
//   }
//   const jwtClaims = await verifyAppleToken({
//     idToken: req.body.id_token,
//     clientId: process.env.APPLE_BUNDLE_ID || "",
//   });
//   const existUser = await userService.getUserByEmail(jwtClaims.email);
//   const user =
//     existUser ??
//     (await userService.createUser({
//       email: jwtClaims.email,
//       provider: ProviderType.APPLE,
//       name: "",
//       active: true,
//       role: "USER",
//     }));
//   const tokens = createUserTokens(user);
//   await userService.editUser(user._id, { refreshToken: tokens.refreshToken });
//   res.send(createResponse(tokens));
// });
// export const fbLogin = asyncHandler(async (req: Request, res: Response) => {
//   const urlSearchParams = new URLSearchParams({
//     fields: "id,name,email,picture",
//     access_token: req.body.access_token,
//   });
//   const { data } = await axios.get<{
//     id: string;
//     name: string;
//     email: string;
//     picture: {
//       data: {
//         url: string;
//       };
//     };
//   }>(`https://graph.facebook.com/v15.0/me?${urlSearchParams.toString()}`);
//   const existUser = await userService.getUserByEmail(data.email);
//   const user =
//     existUser ??
//     (await userService.createUser({
//       email: data.email,
//       provider: ProviderType.FACEBOOK,
//       facebookId: data.id,
//       image: data.picture.data.url,
//       name: data?.name,
//       role: "USER",
//     }));
//   const tokens = createUserTokens(user);
//   await userService.editUser(user._id, { refreshToken: tokens.refreshToken });
//   res.send(createResponse(tokens));
// });
// export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
//   const { data } = await axios.get<{
//     email: string;
//     name: string;
//     picture: string;
//   }>("https://www.googleapis.com/oauth2/v3/userinfo", {
//     headers: { Authorization: "Bearer " + req.body.access_token },
//   });
//   const { email, name = " ", picture } = data;
//   const existUser = await userService.getUserByEmail(data.email);
//   const user =
//     existUser ??
//     (await userService.createUser({
//       email,
//       name,
//       provider: ProviderType.GOOGLE,
//       image: picture,
//       role: "USER",
//     }));
//   const tokens = createUserTokens(user);
//   await userService.editUser(user._id, { refreshToken: tokens.refreshToken });
//   res.send(createResponse(tokens));
// });
// export const linkedInLogin = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { access_token } = req.body;
//     const urlSearchParams = new URLSearchParams({
//       oauth2_access_token: access_token,
//     });
//     const { data: userData } = await axios.get<{
//       sub: string;
//       given_name: string;
//       family_name: string;
//       email: string;
//       picture: string;
//       name: string;
//     }>(`https://api.linkedin.com/v2/userinfo?${urlSearchParams.toString()}`);
//     const existUser = await userService.getUserByEmail(userData.email);
//     const user =
//       existUser ??
//       (await userService.createUser({
//         email: userData.email,
//         name: userData?.name,
//         linkedinId: userData.sub,
//         image: userData.picture,
//         provider: ProviderType.LINKEDIN,
//         role: "USER",
//       }));
//     const tokens = createUserTokens(user);
//     await userService.editUser(user._id, { refreshToken: tokens.refreshToken });
//     res.send(createResponse(tokens));
//   }
// );
//# sourceMappingURL=user.controller.js.map