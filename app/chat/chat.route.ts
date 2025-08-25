// app/chat/chat.route.ts

import { Router } from "express";
import { analyzeFile, createChatReply } from "./chat.controller";
import multer from "multer";
// import passport from "passport"; // If you want to protect the route

const router = Router();

// POST /api/chat
router.post(
  "/",
  // passport.authenticate("jwt", { session: false }), // uncomment to require login
  createChatReply
);

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), analyzeFile);

export default router;
