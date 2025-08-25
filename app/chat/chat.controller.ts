// app/chat/chat.controller.ts

import { type Request, type Response, type NextFunction } from "express";
import { askOpenAI } from "./chat.service";
import { validateChatRequest } from "./chat.validation";
import { ChatResponseDTO } from "./chat.dto";

export async function createChatReply(
  req: Request,
  res: Response<ChatResponseDTO>,
  next: NextFunction
) {
  try {
    const { message, context } = validateChatRequest(req.body);

    // Optional: you can access req.user if authenticated and store conversation, etc.
    // const userId = req.user?._id;

    const reply = await askOpenAI(message, context);

    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
}


export async function analyzeFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Simplest: pass file content name to GPT
    // For PDFs, DOCX, images you’ll need to parse or use GPT-4o’s vision input
    const reply = await askOpenAI(`User uploaded file: ${req.file.originalname}. Summarize its content.`);

    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
}
