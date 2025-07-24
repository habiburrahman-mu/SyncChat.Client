import { ChatNotificationType } from "@core/enums";

export interface ChatNotification<T> {
  type: ChatNotificationType;
  data: T;
}
