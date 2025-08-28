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
      return res.status(400).json({
        success: false,
        error: "Aucun fichier téléchargé. (No file uploaded.)",
      });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let extractedText = "";

    // Enhanced file processing
    try {
      if (ext === ".pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } else if (ext === ".docx") {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      } else if (ext === ".doc") {
        // Basic .doc support (you might need additional libraries for better support)
        extractedText = fs.readFileSync(filePath, "utf-8");
      } else if (ext === ".txt") {
        extractedText = fs.readFileSync(filePath, "utf-8");
      } else {
        return res.status(400).json({
          success: false,
          error: `Unsupported file type: ${ext}. Supported formats: PDF, DOCX, TXT.`,
        });
      }
    } catch (fileError) {
      console.error("File processing error:", fileError);
      return res.status(500).json({
        success: false,
        error:
          "Error reading file. Check if the file is corrupted.",
      });
    }

    if (!extractedText.trim()) {
      extractedText =
        "The file appears empty or text could not be extracted.";
    }

    // Enhanced text cleaning for better processing
    extractedText = extractedText
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n") // Reduce excessive line breaks
      .trim();

    const userId = req.user?._id || "default";
    userDocs[userId] = extractedText;

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting uploaded file:", err);
    });

    // Detect document type for better response
    const docType = analyzeDocumentType(extractedText);

    res.json({
      success: true,
      reply: `I received your document "${req.file.originalname}"${docType ? ` (${docType})` : ""}. You can now ask questions or request a translation.`,
      documentType: docType,
    });
  } catch (err) {
    console.error("File analysis error:", err);
    next(err);
  }
}

// Helper function to analyze document type
function analyzeDocumentType(text: string): string | null {
  const types = {
    "CAF Document": /\b(caf|caisse d'allocations|allocation|apl|als|rsa)\b/i,
    "CPAM/Health Document":
      /\b(cpam|carte vitale|sécurité sociale|remboursement|mutuelle)\b/i,
    "Prefecture Document":
      /\b(prefecture|titre de séjour|récépissé|visa|ofii)\b/i,
    "Employment Document":
      /\b(pôle emploi|contrat de travail|bulletin de salaire|attestation employeur)\b/i,
    "Housing Document":
      /\b(bail|quittance|état des lieux|attestation logement)\b/i,
    "Tax Document":
      /\b(impôt|déclaration|avis d'imposition|taxe d'habitation)\b/i,
    "Banking Document": /\b(banque|rib|relevé|crédit|compte)\b/i,
  };

  for (const [type, pattern] of Object.entries(types)) {
    if (pattern.test(text)) return type;
  }

  return null;
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
