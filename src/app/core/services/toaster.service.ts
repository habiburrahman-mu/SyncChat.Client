import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToasterType } from '@core/types';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private snackBar: MatSnackBar) { }

  show(message: string, type: ToasterType) {
    const config = new MatSnackBarConfig();
    config.duration = 100000;
    config.panelClass = ['toaster', `toaster-${type}`];

    this.snackBar.open(message, 'Close', config);
  }
}
