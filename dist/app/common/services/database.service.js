"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const initDB = async () => {
    return await new Promise((resolve, reject) => {
        const mongodbUri = process.env.MONGODB_URI ?? "";
        if (mongodbUri === "")
            throw new Error("mongod db uri not found!");
        mongoose_1.default.set("strictQuery", false);
        mongoose_1.default
            .connect(mongodbUri)
            .then(() => {
            console.log("DB Connected!");
            resolve(true);
        })
            .catch(reject);
    });
};
exports.initDB = initDB;
