import { MessageType } from "@core/enums";

export interface MessageDTO {
  messageId: number;
  uuid: string;
  conversationId: number;
  senderId: number;
  type: MessageType;
  content: string | null;
  metaData: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  replyTo: number | null;
  isEdited: boolean;
  editedAt: string | null;
}
