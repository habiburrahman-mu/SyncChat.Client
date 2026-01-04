export {};

declare global {
  interface Window {
    google: Google;
  }

  const google: Google;

  interface Google {
    accounts: {
      id: GoogleAccountsId;
    };
  }

  interface GoogleAccountsId {
    initialize(options: GoogleAccountsIdInitializeOptions): void;
    prompt(
      momentListener?: (notification: GooglePromptMomentNotification) => void
    ): void;
    renderButton(
      parent: HTMLElement,
      options: GoogleButtonOptions
    ): void;
  }

  interface GoogleAccountsIdInitializeOptions {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }

  interface GoogleCredentialResponse {
    credential: string; // ID TOKEN (JWT)
    select_by: string;
  }

  interface GooglePromptMomentNotification {
    isDisplayed(): boolean;
    isNotDisplayed(): boolean;
    isSkippedMoment(): boolean;
    getMomentType(): string;
    getNotDisplayedReason(): string;
  }

  interface GoogleButtonOptions {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    width?: number;
    text?: 'signin_with' | 'signup_with' | 'continue_with';
  }
}
