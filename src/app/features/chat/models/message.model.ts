export interface Message {
  messageId: number;
  uuid: string;
  conversationId: number;
  senderId: number;
  content?: string;
}
