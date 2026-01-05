import { inject, Injectable, NgZone, signal } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleIdentityService {
  private initialized = false;
  public googleLoginInProgress = signal<boolean>(false);

  readonly google = google;

  private readonly ngZone = inject(NgZone);
  private readonly document = inject(Document);

  init(): void {
    if (!this.initialized) {
      this.google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          // Google callback is outside Angular zone
          this.ngZone.run(() => {
            this.handleGoogleCredential(response.credential);
          });
        }
      });
    }

    const buttonContainer = this.document.getElementById('google-auth-btn');

    if (buttonContainer) {
      this.google.accounts.id.renderButton(
        buttonContainer,
        { theme: 'outline', size: 'medium', text: 'continue_with' },
      );
    }

    this.initialized = true;
  }

  private handleGoogleCredential(idToken: string): void {
    // TODO: send the ID token to backend for verification and authentication
    this.googleLoginInProgress.set(true);
    console.log('Google ID Token:', idToken);
    setTimeout(() => {
      this.googleLoginInProgress.set(false);
    }, 2000);
  }
}
