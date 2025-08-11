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
exports.verifyToken = exports.decodeToken = exports.createUserTokens = exports.initPassport = exports.isValidPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dayjs_1 = __importDefault(require("dayjs"));
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_local_1 = require("passport-local");
const userService = __importStar(require("../../user/user.service"));
const isValidPassword = async function (value, password) {
    const compare = await bcrypt_1.default.compare(value, password);
    return compare;
};
exports.isValidPassword = isValidPassword;
const initPassport = () => {
    passport_1.default.use(new passport_jwt_1.Strategy({
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    }, async (token, done) => {
        try {
            done(null, token.user);
        }
        catch (error) {
            done(error);
        }
    }));
    passport_1.default.use("login", new passport_local_1.Strategy({
        usernameField: "email",
        passwordField: "password",
    }, async (email, password, done) => {
        try {
            const user = await userService.getUserByEmail(email, {
                password: true,
                name: true,
                email: true,
                active: true,
                role: true,
                provider: true,
            });
            if (user == null) {
                done((0, http_errors_1.default)(401, "User not found!"), false);
                return;
            }
            if (!user.active) {
                done((0, http_errors_1.default)(401, "User is inactive"), false);
                return;
            }
            if (user.blocked) {
                done((0, http_errors_1.default)(401, "User is blocked, Contact to admin"), false);
                return;
            }
            const validate = await (0, exports.isValidPassword)(password, user.password);
            if (!validate) {
                done((0, http_errors_1.default)(401, "Invalid email or password"), false);
                return;
            }
            const { password: _p, ...result } = user;
            done(null, result, { message: "Logged in Successfully" });
        }
        catch (error) {
            done((0, http_errors_1.default)(500, error.message));
        }
    }));
};
exports.initPassport = initPassport;
const createUserTokens = (user) => {
    const jwtSecret = process.env.JWT_SECRET ?? "";
    const accessToken = jsonwebtoken_1.default.sign(user, jwtSecret, {
        expiresIn: "30m",
    });
    const refreshToken = jsonwebtoken_1.default.sign(user, jwtSecret, {
        expiresIn: "2d",
    });
    return { accessToken, refreshToken };
};
exports.createUserTokens = createUserTokens;
const decodeToken = (token) => {
    const decode = jsonwebtoken_1.default.decode(token);
    const expired = dayjs_1.default.unix(decode.exp).isBefore((0, dayjs_1.default)());
    return { ...decode, expired };
};
exports.decodeToken = decodeToken;
const verifyToken = (token) => {
    const jwtSecret = process.env.JWT_SECRET ?? "";
    const decode = jsonwebtoken_1.default.verify(token, jwtSecret);
    return decode;
};
exports.verifyToken = verifyToken;
