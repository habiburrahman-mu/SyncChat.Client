import { SystemMessageType } from "@core/enums";
import { ConversationMemberDTO } from "../models";

export class SystemMessageUtil {
  static getSystemMessage(metaData: Record<string, any> | undefined, conversationMemberList: ConversationMemberDTO[], currentUserId: number): string {
    if(metaData && metaData['Type']) {
      const type = metaData['Type'] as SystemMessageType;
      if(type === SystemMessageType.ConversationCreated) {
        const createdBy = metaData['CreatedBy'] as string;
        if(createdBy !== undefined) {
          return `${this.getNameById(Number(createdBy), conversationMemberList, currentUserId) || 'Someone'} created the conversation.`;
        }
      } else if(type === SystemMessageType.MemberAdded) {
        const addedBy = metaData['AddedBy'] as string;
        const memberId = metaData['UserId'] as string;

        if(addedBy !== undefined && memberId !== undefined) {
          return `${this.getNameById(Number(addedBy), conversationMemberList, currentUserId) || 'Someone'} added ${this.getNameById(Number(memberId), conversationMemberList, currentUserId) || 'a member'}.`;
        }
      }
    }

    return '';
  }

  private static getNameById(userId: number, conversationMemberList: ConversationMemberDTO[], currentUserId: number): string | null {
    if(userId === currentUserId) return 'You';
    return conversationMemberList.find(m => m.userID === userId)?.name || null;
  }
}
