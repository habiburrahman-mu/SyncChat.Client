import { MessageType } from "@core/enums";

export interface SendMediaMessageResponse {
  messageId: number;
  uuid: string;
  conversationId: number;
  senderId: number;
  type: MessageType;
  mediaId: string;
  content?: string;
  senderUserName: string;
  senderByName: string;
  updatedAt: string;
  metaData?: string;
  replyTo?: number | null;
}
