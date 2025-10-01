export interface GetLastMessageResponse {
  lastMessageId: number;
  content: string | null;
  metaData: string | null; // JSON string
}
