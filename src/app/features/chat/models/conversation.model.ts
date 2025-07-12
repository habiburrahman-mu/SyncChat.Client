import { ConversationType } from "@core/enums";
import { Message } from ".";

export interface Conversation {
  id: number;
  name: string;
  lastMessage: string | null;
  conversationType: ConversationType;
  members: number[];
  otherUserId: number | null;
  messages?: Message[] | undefined
}
