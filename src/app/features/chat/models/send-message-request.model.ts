import { MessageType } from "@core/enums";

export interface SendMessageRequest {
  conversationId: number;
  senderId: number;
  type: MessageType;
  content?: string;
  metaData?: string;
  replyTo?: number | null;
}
