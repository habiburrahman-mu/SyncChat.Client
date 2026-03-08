import { DestroyRef, Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalStorageService } from '@core/services';
import { LocalStorageKey } from '@core/enums';

@Injectable({
  providedIn: 'root'
})
export class ChatPanelStateService {
  readonly chatDetailPanelOpen = signal<boolean>(false);
  readonly chatListPanelOpen = signal<boolean>(false);
  readonly chatListPanelPinned = signal<boolean>(false);
  readonly isMobileScreen = signal<boolean>(false);

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly breakpoints: BreakpointObserver,
    private readonly destroyRef: DestroyRef
  ) {
    const isPinned = this.localStorageService.getItem<boolean>(LocalStorageKey.ChatSideBarPinned);
    this.chatListPanelPinned.set(isPinned ?? false);
    if (this.chatListPanelPinned()) {
      this.chatListPanelOpen.set(true);
    }

    this.breakpoints.observe([Breakpoints.Handset])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.isMobileScreen.set(result.matches);
        if (this.isMobileScreen()) {
          if (this.chatDetailPanelOpen()) {
            this.toggleChatListPanelPinned();
          }
          this.chatListPanelOpen.set(false);
        }
      });
  }

  isMobile(): boolean {
    return this.isMobileScreen();
  }

  toggleChatListPanelPinned() {
    this.chatListPanelPinned.set(!this.chatListPanelPinned());
    this.localStorageService.setItem<boolean>(LocalStorageKey.ChatSideBarPinned, this.chatListPanelPinned());
  }

  toggleChatDetailPanel() {
    this.chatDetailPanelOpen.set(!this.chatDetailPanelOpen());
  }

  toggleChatListPanel() {
    if (!this.chatListPanelPinned()) {
      this.chatListPanelOpen.set(!this.chatListPanelOpen());
    }
  }
}
