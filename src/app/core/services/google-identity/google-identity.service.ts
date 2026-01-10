import { inject, Injectable, NgZone, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { AuthHttpService } from '@features/auth/services';
import { AuthService, LocalStorageService } from '..';
import { FEATURE_ROUTE_PATH } from '@core/constants';
import { Router } from '@angular/router';
import { LocalStorageKey } from '@core/enums';

@Injectable({
  providedIn: 'root',
})
export class GoogleIdentityService {
  private initialized = false;
  public googleLoginInProgress = signal<boolean>(false);

  readonly google = google;

  private readonly ngZone = inject(NgZone);
  private readonly document = inject(Document);
  private readonly authHttpService = inject(AuthHttpService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly localStorageService = inject(LocalStorageService);


  init(): void {
    if (!this.initialized) {
      this.google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: GoogleCredentialResponse) => {
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
    this.googleLoginInProgress.set(true);

    this.authHttpService.googleAuth({
      idToken: idToken,
      deviceIdentifier: this.authService.getDeviceIdentifier()
    }).subscribe({
      next: accessToken => {
         this.localStorageService.setItem(LocalStorageKey.Token, accessToken);
         this.authService.setAuthState(true);
         this.googleLoginInProgress.set(false);
         this.routeToChatHome();
      },
      error: _ => {
        this.googleLoginInProgress.set(false);
      }
    });
  }

  private routeToChatHome() {
    this.router.navigate([FEATURE_ROUTE_PATH.Chat]);
  }
}
