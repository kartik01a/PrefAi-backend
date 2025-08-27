// app/chat/chat.service.ts

import OpenAI from "openai";
import { ChatMessageItem } from "./chat.dto";
const { Translate } = require("@google-cloud/translate").v2;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

const DEFAULT_SYSTEM: ChatMessageItem = {
  role: "system",
  content:
    "You are a helpful assistant inside our mobile app. Keep answers concise and clear.",
};

export async function askOpenAI(
  latest: string,
  context?: ChatMessageItem[],
  docContext?: string
): Promise<string> {
  const messages: ChatMessageItem[] = [
    DEFAULT_SYSTEM,
    ...(context ?? []),
  ];
  if (docContext) {
    messages.push({ role: "system", content: docContext });
  }
  messages.push({ role: "user", content: latest });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 512,
  });
  return completion.choices?.[0]?.message?.content?.trim() ?? "Sorry, I have no reply.";
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
