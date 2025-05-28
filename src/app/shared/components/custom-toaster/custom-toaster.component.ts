import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ToasterData } from '@core/models';

@Component({
  selector: 'chat-custom-toaster',
  imports: [MatIcon, CommonModule],
  templateUrl: './custom-toaster.component.html',
  styleUrl: './custom-toaster.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomToasterComponent {

  duration: number;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ToasterData,
    private snackBarRef: MatSnackBarRef<CustomToasterComponent>
  ) {
    this.duration = data.duration;
  }

  close() {
    this.snackBarRef.dismiss();
  }
}
