import { ConversationType } from "@core/enums";
import { Message } from ".";
import { Signal, WritableSignal } from "@angular/core";

export interface Conversation {
  id: number;
  name: string;
  lastMessage: string | null;
  conversationType: ConversationType;
  members: number[];
  otherUserId: number | null;
  messages: WritableSignal<Message[] | undefined>;
  hasMoreMessages: boolean;
  olderMessageLoading: WritableSignal<boolean>;
  hasUnreadMessages?: boolean;
}
