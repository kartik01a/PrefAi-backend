// app/chat/chat.controller.ts

import { type Request, type Response, type NextFunction } from "express";
import { askOpenAI, translateService } from "./chat.service";
import { validateChatRequest } from "./chat.validation";
import { ChatResponseDTO } from "./chat.dto";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const userDocs: Record<string, string> = {};

export async function createChatReply(
  req: Request,
  res: Response<ChatResponseDTO>,
  next: NextFunction
) {
  try {
    const { message, context } = validateChatRequest(req.body);
    const userId = req.user?._id || "default";
    const docText = userDocs[userId];
    const reply = await askOpenAI(
      message,
      context,
      docText
        ? `The user uploaded a document. Use this as context:\n${docText}`
        : undefined
    );
    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
}

export async function analyzeFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let extractedText = "";
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (ext === ".txt") {
      extractedText = fs.readFileSync(filePath, "utf-8");
    } else {
      extractedText = `File uploaded: ${req.file.originalname}, but unsupported type.`;
    }
    if (!extractedText.trim()) {
      extractedText = "Could not extract text from file.";
    }
    const userId = req.user?._id || "default";
    userDocs[userId] = extractedText;

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting uploaded file:", err);
    });

    res.json({
      success: true,
      reply: `I have received your file "${req.file.originalname}". You can now ask me questions about it.`,
    });
  } catch (err) {
    next(err);
  }
}

export async function translate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log(req.body);
    const { text, from, to } = req.body;

    // Validate input
    if (!text || !from || !to) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: text, from, to",
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Text cannot be empty",
      });
    }

    if (from === to) {
      return res.json({
        success: true,
        translatedText: text,
        originalText: text,
        fromLanguage: from,
        toLanguage: to,
      });
    }
    const reply = await translateService(text, from, to);

    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
}
