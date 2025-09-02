// app/chat/chat.route.ts

import { Router } from "express";
import {
  analyzeFile,
  createChatReply,
  transcribeAudio,
  translate,
} from "./chat.controller";
import multer from "multer";
import path from "path";
// import passport from "passport"; // If you want to protect the route

const router = Router();
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    console.log(ext, "ext name"); // get original extension (.m4a, .mp3, etc.)
    cb(null, `${Date.now()}-${file.fieldname}${ext}`); // keep correct extension
  },
});

const uploadAudio = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// POST /api/chat
router.post("/", createChatReply);
router.post("/translate", translate);

const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 },
  dest: "uploads/",
});
router.post("/transcribe", uploadAudio.single("audio"), transcribeAudio);

router.post("/upload", upload.single("file"), analyzeFile);

export default router;
