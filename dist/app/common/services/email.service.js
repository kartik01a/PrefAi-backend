"use strict";
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
const sendEmail = async (mailOptions, transport = Transport.SMTP) => {
    try {
        if (transporters[transport]) {
            return await transporters[transport].sendMail(mailOptions);
        }
        else {
            throw new Error(`${transport} not initialized`);
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendEmail = sendEmail;
const resetPasswordEmailTemplate = (token = "") => `
<html>
  <body>
    <h3>Welcome to app</h3>
    <p>Click <a href="${process.env.FE_BASE_URL}/reset-password?token=${token}">here</a> to reset your password</p>
  </body>
</html>`;
exports.resetPasswordEmailTemplate = resetPasswordEmailTemplate;
