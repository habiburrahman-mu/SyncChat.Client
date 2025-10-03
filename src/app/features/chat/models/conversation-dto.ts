import { ConversationType, MessageType } from "@core/enums";

export interface ConversationDTO {
  conversationId: number;
  uuid: string;
  type: ConversationType;
  name: string;
  avatarUrl: string | null;
  createdBy: number | null;
  createdAt: string;       // ISO 8601 date string
  updatedAt: string;       // ISO 8601 date string
  lastMessageId: number | null;
  settings: string;        // JSON string
  lastMessage: string | null;
  lastMessageMetaData: string | null; // JSON string
  lastMessageType: MessageType | null;
  otherUserId: number | null; // for direct chats, pick the OTHER member's id;
  lastSeenMessageId: number | null;
  haveUnreadMessages: boolean; // for direct chats, pick the OTHER member's id;
}
