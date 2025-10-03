import { MessageType } from "@core/enums";

export interface GetLastMessageResponse {
  lastMessageId: number;
  messageType: MessageType | null;
  content: string | null;
  metaData: string | null; // JSON string
}
