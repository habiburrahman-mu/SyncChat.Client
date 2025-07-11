import { ConversationType } from "@core/enums";

export interface Conversation {
  id: number;
  name: string;
  lastMessage: string | null;
  conversationType: ConversationType;
  members: number[];
  otherUserId: number | null;
}
