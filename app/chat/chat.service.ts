// app/chat/chat.service.ts

import OpenAI from "openai";
import { ChatMessageItem } from "./chat.dto";

// Initialize once per process
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    completion.choices?.[0]?.message?.content?.trim() ?? "Sorry, I have no reply.";

  return reply;
}
