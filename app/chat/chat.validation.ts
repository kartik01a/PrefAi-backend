// app/chat/chat.validation.ts

import { ChatMessageItem, ChatRequestDTO } from "./chat.dto";

export function validateChatRequest(body: any): ChatRequestDTO {
  if (!body || typeof body.message !== "string" || body.message.trim() === "") {
    const err: any = new Error("`message` is required and must be a non-empty string.");
    err.status = 400;
    throw err;
  }

  const payload: ChatRequestDTO = {
    message: body.message.trim(),
    responseLanguage: body?.language || "english",
    context: Array.isArray(body.context)
      ? body.context.filter(isChatMessageItem)
      : undefined,
  };

  return payload;
}

function isChatMessageItem(x: any): x is ChatMessageItem {
  return (
    x &&
    typeof x === "object" &&
    (x.role === "system" || x.role === "user" || x.role === "assistant") &&
    typeof x.content === "string"
  );
}
