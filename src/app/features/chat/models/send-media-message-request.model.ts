import { MessageType } from "@core/enums";

export interface SendMediaMessageRequest {
  conversationId: number;
  senderId: number;
  type: MessageType;
  mediaId: string;
  caption?: string;
  replyTo?: number | null;
}
