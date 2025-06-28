import { ConversationType } from "@core/enums";

export interface CreateConversationRequest {
  createdBy: number;
  memberIdList: number[];
  name: string;
  type: ConversationType;
  initialMessage: string;
}
