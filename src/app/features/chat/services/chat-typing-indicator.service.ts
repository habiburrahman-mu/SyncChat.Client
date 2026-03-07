import { computed, Injectable, signal } from '@angular/core';
import { NotificationService } from '@core/services';
import { UI_CONSTANTS } from '@core/constants';

@Injectable({
  providedIn: 'root'
})
export class ChatTypingIndicatorService {
  private readonly indicators = signal<Set<number>>(new Set());
  private readonly timeouts = new Map<number, ReturnType<typeof setTimeout>>();

  readonly isAnyoneTyping = computed(() => this.indicators().size > 0);

  constructor(private readonly notificationService: NotificationService) {}

  userStartedTyping(userId: number) {
    this._setIndicator(userId, true);

    clearTimeout(this.timeouts.get(userId));

    const timeout = setTimeout(() => {
      this._setIndicator(userId, false);
      this.timeouts.delete(userId);
    }, UI_CONSTANTS.CHAT.TYPING_INDICATOR_DELAY);

    this.timeouts.set(userId, timeout);
  }

  userStoppedTyping(userId: number) {
    clearTimeout(this.timeouts.get(userId));
    this.timeouts.delete(userId);
    this._setIndicator(userId, false);
  }

  clearAll() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.indicators.set(new Set());
  }

  sendTyping(conversationId: number, isTyping: boolean) {
    this.notificationService.typing(conversationId, isTyping);
  }

  private _setIndicator(userId: number, isTyping: boolean) {
    const updated = new Set(this.indicators());
    if (isTyping) {
      updated.add(userId);
    } else {
      updated.delete(userId);
    }
    this.indicators.set(updated);
  }
}
