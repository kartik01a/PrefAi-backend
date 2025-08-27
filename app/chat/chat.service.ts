// app/chat/chat.service.ts

import OpenAI from "openai";
import { ChatMessageItem } from "./chat.dto";
const { Translate } = require("@google-cloud/translate").v2;

// Initialize once per process
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

// Minimal system prompt you can customize
const DEFAULT_SYSTEM: ChatMessageItem = {
  role: "system",
  content:
    "You are a helpful assistant inside our mobile app. Keep answers concise and clear.",
};

export async function askOpenAI(
  latest: string,
  context?: ChatMessageItem[]
): Promise<string> {
  // Build the messages array (system + context + latest user)
  const messages = [
    DEFAULT_SYSTEM,
    ...(context ?? []),
    { role: "user", content: latest } as ChatMessageItem,
  ];

  // Chat Completions API (stable, supported indefinitely)
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 512,
  });

  const reply =
    completion.choices?.[0]?.message?.content?.trim() ??
    "Sorry, I have no reply.";

  return reply;
}
export async function translateService(text: string, from: string, to: string) {
  try {
    const [translation] = await translate.translate(text, {
      from: from,
      to: to,
    });

    return {
      success: true,
      translatedText: translation,
    };
  } catch (error: any) {
    console.error("Translation error:", error);

    if (error.code === 400) {
      return {
        success: false,
        error:
          "Invalid translation request. Please check language codes and text.",
      };
    }

    if (error.code === 403) {
      return {
        success: false,
        error: "API key invalid or quota exceeded.",
      };
    }

    return {
      success: false,
      error: "Translation service temporarily unavailable",
    };
  }
}
