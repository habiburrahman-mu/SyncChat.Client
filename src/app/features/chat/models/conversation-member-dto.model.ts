import { MemberRole } from "@core/enums";

export interface ConversationMemberDTO {
  conversationMemberId: number;
  userID: number;          // long -> number
  userName: string;
  name: string;
  avatarUrl: string | null;
  role: MemberRole;        // Assuming MemberRole is defined as a TS enum or type
  joinedAt: string;        // DateTimeOffset serialized as ISO 8601 string
  isActive: boolean;
  leftAt: string | null;   // DateTimeOffset serialized as ISO 8601 string or null
}
