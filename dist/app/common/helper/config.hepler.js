"use strict";
// import dotenv from "dotenv";
// import process from "process";
// import path from "path";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
// export const loadConfig = () => {
//   const env = process.env.NODE_ENV ?? "local";
//   const filepath = path.join(process.cwd(), `.env.${env}`);
//   dotenv.config({ path: filepath });
// };
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
const loadConfig = () => {
    var _a;
    const env = (_a = process_1.default.env.NODE_ENV) !== null && _a !== void 0 ? _a : "local";
    const filepath = path_1.default.join(process_1.default.cwd(), `.env.${env}`);
    if (fs_1.default.existsSync(filepath)) {
        dotenv_1.default.config({ path: filepath });
        // small informative log (optional)
        // console.info(`Loaded env from ${filepath}`);
    }
    else {
        // In AWS/production you should set environment variables via the platform
        // This avoids accidentally loading local files in production.
        // console.info(`Env file ${filepath} not found — relying on process.env`);
    }
};
exports.loadConfig = loadConfig;
//# sourceMappingURL=config.hepler.js.map