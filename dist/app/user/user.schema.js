"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_dto_1 = require("./user.dto");
const Schema = mongoose_1.default.Schema;
const hashPassword = async (password) => {
    const hash = await bcrypt_1.default.hash(password, 12);
    return hash;
};
exports.hashPassword = hashPassword;
const UserSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    refreshToken: { type: String, default: "", select: false },
    active: { type: Boolean, default: true },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
    blocked: { type: Boolean, default: false },
    blockReason: { type: String, default: "" },
    provider: {
        type: String,
        enum: Object.values(user_dto_1.ProviderType),
        default: user_dto_1.ProviderType.MANUAL,
    },
    image: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String },
    securityNumber: { type: String },
    title: { type: String },
    country: { type: String },
    maritalStatus: { type: String },
    dob: { type: Date },
    arrivalDate: { type: Date },
    language: { type: String },
    passportNumber: { type: String, required: true },
}, { timestamps: true });
UserSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password") && user.password) {
        user.password = await (0, exports.hashPassword)(user.password);
    }
    next();
});
exports.default = mongoose_1.default.model("user", UserSchema);
