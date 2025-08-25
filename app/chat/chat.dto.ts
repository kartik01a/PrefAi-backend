// app/chat/chat.dto.ts

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessageItem {
  role: ChatRole;
  content: string;
}

export interface ChatRequestDTO {
  message: string;                    
  context?: ChatMessageItem[];   
}

export interface ChatResponseDTO {
  success: boolean;
  reply: string;
}
