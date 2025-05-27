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

  show(type: ToasterType, title: string, summary: string | undefined = undefined) {
    const config = new MatSnackBarConfig<ToasterData>();
    config.duration = 100000;
    config.panelClass = ['toaster', `toaster-${type}`];

    config.data = { title, summary };

    this.snackBar.openFromComponent(CustomToasterComponent, config);
  }
}
