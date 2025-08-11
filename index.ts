import bodyParser from "body-parser";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import http from "http";
import morgan from "morgan";

import { loadConfig } from "./app/common/helper/config.hepler";
loadConfig();

import errorHandler from "./app/common/middleware/error-handler.middleware";
import { initDB } from "./app/common/services/database.service";
import { initPassport } from "./app/common/services/passport-jwt.service";
import routes from "./app/routes";
import { type IUser } from "./app/user/user.dto";
import { stripeWebhookHandler } from "./app/subscription/subscription.controller";
import Stripe from "stripe";

declare global {
  namespace Express {
    interface User extends Omit<IUser, "password"> {}
    interface Request {
      user?: User;
    }
  }
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

export const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const port = Number(process.env.PORT) ?? 5000;

const app: Express = express();
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

const initApp = async (): Promise<void> => {
  // init mongodb
  await initDB();

  // passport init
  initPassport();

  // set base path to /api
  app.use("/api", routes);

  app.get("/", (req: Request, res: Response) => {
    res.send({ status: "ok" });
  });

  // error handler
  app.use(errorHandler);
  http.createServer(app).listen(port, () => {
    console.log(
      `Server is running on port ${port} (NODE_ENV=${process.env.NODE_ENV})`
    );
  });
};

void initApp();
