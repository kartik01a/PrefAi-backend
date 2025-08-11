"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
const loadConfig = () => {
    const env = process_1.default.env.NODE_ENV ?? "local";
    const filepath = path_1.default.join(process_1.default.cwd(), `.env.${env}`);
    dotenv_1.default.config({ path: filepath });
};
exports.loadConfig = loadConfig;
