"use strict";
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
exports.resetPasswordEmailTemplate = exports.sendEmail = exports.Transport = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_hepler_1 = require("../helper/config.hepler");
(0, config_hepler_1.loadConfig)();
var Transport;
(function (Transport) {
    Transport["SMTP"] = "SMTP";
})(Transport || (exports.Transport = Transport = {}));
const transporters = {
    [Transport.SMTP]: null,
};
if (process.env.SMTP_ENABLE && parseInt(process.env.SMTP_ENABLE) == 1) {
    transporters[Transport.SMTP] = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_MAIL_USER,
            pass: process.env.SMTP_MAIL_PASS,
        },
    });
}
const sendEmail = (mailOptions_1, ...args_1) => __awaiter(void 0, [mailOptions_1, ...args_1], void 0, function* (mailOptions, transport = Transport.SMTP) {
    try {
        if (transporters[transport]) {
            return yield transporters[transport].sendMail(mailOptions);
        }
        else {
            throw new Error(`${transport} not initialized`);
        }
    }
    catch (error) {
        console.log(error);
        // throw createHttpError(500, { message: error.message });
    }
});
exports.sendEmail = sendEmail;
const resetPasswordEmailTemplate = (token = "") => `
<html>
  <body>
    <h3>Welcome to app</h3>
    <p>Click <a href="${process.env.FE_BASE_URL}/reset-password?token=${token}">here</a> to reset your password</p>
  </body>
</html>`;
exports.resetPasswordEmailTemplate = resetPasswordEmailTemplate;
//# sourceMappingURL=email.service.js.map