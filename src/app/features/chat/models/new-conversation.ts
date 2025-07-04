import { GetUserByUserNameResponse } from ".";

export interface NewConversation {
  selectedUsers: GetUserByUserNameResponse[];
  conversationName: string;
}
