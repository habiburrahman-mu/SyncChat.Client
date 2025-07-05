import { ConversationType } from "@core/enums";

export interface ConversationDTO {
  conversationId: number;
  uuid: string;
  type: ConversationType;
  name: string | null;
  avatarUrl: string | null;
  createdBy: number | null;
  createdAt: string;       // ISO 8601 date string
  updatedAt: string;       // ISO 8601 date string
  lastMessageId: number | null;
  settings: string;        // JSON string
  lastMessage: string | null;
}
