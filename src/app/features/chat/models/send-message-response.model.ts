import { MessageType } from "@core/enums";

export interface SendMessageResponse {
  messageId: number;
  uuid: string;
  conversationId: number;
  senderId: number;
  type: MessageType;
  content?: string;
  metaData?: string;
  replyTo?: number | null;
  senderUserName: string;
  senderName: string;
  updatedAt: string;
}
