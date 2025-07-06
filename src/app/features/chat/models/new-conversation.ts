import { ConversationType } from "@core/enums";
import { GetUserByUserNameResponse } from ".";

export interface NewConversation {
  selectedUsers: GetUserByUserNameResponse[];
  conversationName: string;
  conversationType: ConversationType;
}
