import { MemberRole } from "@core/enums";

export interface ConversationMemberDTO {
  userID: number;          // long -> number
  userName: string;
  name: string;
  role: MemberRole;        // Assuming MemberRole is defined as a TS enum or type
  joinedAt: string;        // DateTimeOffset serialized as ISO 8601 string
}
