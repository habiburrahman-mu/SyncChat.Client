import { ConversationType, MessageType } from "@core/enums";
import { Message } from ".";
import { Signal, WritableSignal } from "@angular/core";

export interface Conversation {
  id: number;
  name: string;
  lastMessage: string | null;
  lastMessageMetaData: Record<string, any> | null;
  lastMessageType: MessageType | null;
  conversationType: ConversationType;
  members: number[];
  otherUserId: number | null;
  messages: WritableSignal<Message[] | undefined>;
  hasMoreMessages: boolean;
  olderMessageLoading: WritableSignal<boolean>;
  lastSeenMessageId: number | null;
  hasUnreadMessages: boolean;
  avatarUrl: string | null;
}
