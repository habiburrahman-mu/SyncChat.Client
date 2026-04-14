import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'chat-pwa-install-prompt',
  imports: [MatButtonModule, MatIconModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './pwa-install-prompt.component.html',
  styleUrl: './pwa-install-prompt.component.scss',
})
export class PwaInstallPromptComponent {
  private deferredPrompt: any = null;
  isVisible = signal(false);
  isInstalled = signal(false);
  showManualInstructions = signal(false);
  private hasUserInteracted = false;

  constructor() {
    console.log('PWA Install Prompt: Component initialized');
    this.checkIfInstalled();
    this.listenForUserInteraction();
    this.listenForInstallPrompt();
    this.listenForAppInstalled();
  }

  private checkIfInstalled() {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    if (isStandalone || isInWebAppiOS || document.referrer.includes('android-app://')) {
      this.isInstalled.set(true);
    }
  }

  private listenForUserInteraction() {
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    const handler = () => {
      this.hasUserInteracted = true;
      console.log('PWA Install Prompt: User has interacted with the page');
      events.forEach(event => window.removeEventListener(event, handler));
    };
    events.forEach(event => window.addEventListener(event, handler, { once: true }));
  }

  private listenForInstallPrompt() {
    console.log('PWA Install Prompt: Listening for beforeinstallprompt event');

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA Install Prompt: beforeinstallprompt event fired', e);
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;

      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('PWA Install Prompt: Is mobile device:', isMobile);

      // Only show if user has interacted (required by some browsers)
      if (this.hasUserInteracted) {
        this.isVisible.set(true);
        console.log('PWA Install Prompt: Prompt should now be visible');
      } else {
        console.log('PWA Install Prompt: User has not interacted yet, waiting...');
        // Wait for user interaction, then show
        const showPrompt = () => {
          if (this.deferredPrompt) {
            this.isVisible.set(true);
            console.log('PWA Install Prompt: Prompt shown after user interaction');
          }
        };
        const events = ['click', 'touchstart', 'keydown'];
        const handler = () => {
          showPrompt();
          events.forEach(event => window.removeEventListener(event, handler));
        };
        events.forEach(event => window.addEventListener(event, handler, { once: true }));
      }
    });

    // Check if service worker is ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('PWA Install Prompt: Service worker is ready');
      }).catch(err => {
        console.error('PWA Install Prompt: Service worker failed to become ready', err);
      });
    }

    // Fallback for mobile devices where beforeinstallprompt might not fire
    // Check after a delay if we haven't received the event
    setTimeout(() => {
      if (!this.deferredPrompt && !this.isInstalled()) {
        console.log('PWA Install Prompt: No beforeinstallprompt event received, checking manual installation options');
        this.checkManualInstallOptions();
      }
    }, 5000);
  }

  private listenForAppInstalled() {
    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.isVisible.set(false);
      this.deferredPrompt = null;
    });
  }

  async installPWA() {
    if (!this.deferredPrompt) return;

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    // Reset the deferred prompt variable
    this.deferredPrompt = null;

    // Hide the install prompt
    this.isVisible.set(false);

    // Optionally, send analytics event with outcome
    console.log(`User response to install prompt: ${outcome}`);
  }

  dismiss() {
    this.isVisible.set(false);
    this.showManualInstructions.set(false);
  }

  // For debugging/testing purposes
  showPromptForTesting() {
    if (this.deferredPrompt) {
      this.isVisible.set(true);
      console.log('PWA Install Prompt: Manually showing prompt for testing');
    } else {
      console.log('PWA Install Prompt: No deferred prompt available');
    }
  }

  // Check if the current environment supports PWA installation
  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled();
  }

  // Check if the current device is mobile
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Check if the current device is iOS
  isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  // Fallback method for mobile devices where beforeinstallprompt might not fire
  private checkManualInstallOptions() {
    const isMobile = this.isMobileDevice();

    if (isMobile && !this.deferredPrompt) {
      console.log('PWA Install Prompt: Mobile device detected, showing manual install instructions');
      // For mobile devices, show manual installation instructions after a short delay
      setTimeout(() => {
        if (!this.isVisible() && !this.isInstalled()) {
          this.showManualInstructions.set(true);
          console.log('PWA Install Prompt: Manual install UI should be visible');
        }
      }, 2000);
    }
  }
}
