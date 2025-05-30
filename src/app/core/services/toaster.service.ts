import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToasterData } from '@core/models';
import { ToasterType } from '@core/types';
import { CustomToasterComponent } from '@shared/components';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {

  constructor(private snackBar: MatSnackBar) { console.log('test') }

  success(title: string, summary?: string) {
    this.show('success', title, summary);
  }

  info(title: string, summary?: string) {
    this.show('info', title, summary);
  }

  warning(title: string, summary?: string) {
    this.show('warning', title, summary);
  }

  error(title: string, summary?: string) {
    this.show('danger', title, summary);
  }

  invalidForm(title?: string, summary?: string) {
    title = title ?? "Form Validation Error";
    summary = summary ?? "Some fields are missing or incorrect. Please check and try again.";

    this.warning(title, summary);
  }

  private show(type: ToasterType, title: string, summary: string | undefined = undefined) {
    const config = new MatSnackBarConfig<ToasterData>();
    config.duration = 4000;
    config.panelClass = ['custom-toaster', this.getPanelClass(type)];

    config.data = { title, summary, duration: config.duration };

    this.snackBar.openFromComponent(CustomToasterComponent, config);
  }

  private getPanelClass(type: ToasterType): string {
    switch (type) {
      case 'success':
        return 'custom-toaster-success';
      case 'info':
        return 'custom-toaster-info';
      case 'warning':
        return 'custom-toaster-warning';
      case 'danger':
        return 'custom-toaster-danger';
      default:
        return 'custom-toaster-info';
    }
  }
}
