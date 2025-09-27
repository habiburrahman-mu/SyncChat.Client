import { inject, Pipe, PipeTransform } from '@angular/core';
import { SystemMessageType } from '@core/enums';
import { AuthService } from '@core/services';
import { ConversationMemberDTO } from '@features/chat/models';

@Pipe({
  name: 'systemMessage'
})
export class SystemMessagePipe implements PipeTransform {
  private readonly authService = inject(AuthService);
  transform(metaData: Record<string, any> | undefined, conversationMemberList: ConversationMemberDTO[]): string {
    if(metaData && metaData['Type']) {
      const type = metaData['Type'] as SystemMessageType;
      if(type === SystemMessageType.ConversationCreated) {
        const createdBy = metaData['CreatedBy'] as string;
        if(createdBy !== undefined) {
          return `${this.getNameById(Number(createdBy), conversationMemberList) || 'Someone'} created the conversation.`;
        }
      }
    }

    return '';
  }

  private getNameById(userId: number, conversationMemberList: ConversationMemberDTO[]): string | null {
    var currentUserId = this.authService.userId;
    if(userId === currentUserId) return 'You';
    return conversationMemberList.find(m => m.userID === userId)?.name || null;
  }

}
