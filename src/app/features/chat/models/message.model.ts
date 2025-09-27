import { MessageType } from "@core/enums";

export interface Message {
  messageId: number;
  uuid: string;
  conversationId: number;
  senderId: number;
  type: MessageType;
  content: string | null;
  senderUserName: string;
  senderName: string;
  updatedAt: string;
  metaData?: string;
}
