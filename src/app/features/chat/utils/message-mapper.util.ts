import { Message, MessageDTO } from "../models";

export class MessageMapper {
  // static toDTO(message: Message): MessageDTO {
  //   return {

  //   };
  // }

  static fromDTO(dto: MessageDTO): Message {
    const message: Message = {
      messageId: dto.messageId,
      uuid: dto.uuid,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      content: dto.content,
      senderUserName: dto.senderUserName,
      senderName: dto.senderName,
      updatedAt: dto.updatedAt,
      metaData: dto.metaData && dto.metaData !== '{}' ? JSON.parse(dto.metaData) : undefined,
      type: dto.type
    };

    return message;
  }
}
