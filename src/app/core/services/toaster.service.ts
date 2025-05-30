import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToasterData } from '@core/models';
import { ToasterType } from '@core/types';
import { CustomToasterComponent } from '@shared/components';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private snackBar: MatSnackBar) { }

  success(title: string, summary?: string) {
    this.show('success', title, summary);
  }

  info(title: string, summary?: string) {
    this.show('info', title, summary);
  }

  warning(title: string, summary?: string) {
    this.show('warning', title, summary);
  }

  danger(title: string, summary?: string) {
    this.show('danger', title, summary);
  }

  private show(type: ToasterType, title: string, summary: string | undefined = undefined) {
    const config = new MatSnackBarConfig<ToasterData>();
    config.duration = 5000;
    config.panelClass = this.getPanelClass(type);

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
