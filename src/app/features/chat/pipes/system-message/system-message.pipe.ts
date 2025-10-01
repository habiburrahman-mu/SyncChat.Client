import { inject, Pipe, PipeTransform } from '@angular/core';
import { SystemMessageType } from '@core/enums';
import { AuthService } from '@core/services';
import { ConversationMemberDTO } from '@features/chat/models';
import { SystemMessageUtil } from '@features/chat/utils';

@Pipe({
  name: 'systemMessage'
})
export class SystemMessagePipe implements PipeTransform {
  private readonly authService = inject(AuthService);
  transform(metaData: Record<string, any> | undefined, conversationMemberList: ConversationMemberDTO[]): string {
    return SystemMessageUtil.getSystemMessage(metaData, conversationMemberList, this.authService.userId!);
  }
}
