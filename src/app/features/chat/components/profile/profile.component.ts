import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services';
import { GetUserDetailResponse, UpdateUserRequest } from '@features/chat/models';
import { UserService } from '@features/chat/services/user.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'chat-profile',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  private readonly currentUserId = this.authService.userId;
  private readonly reload$ = new Subject<void>();

  editEnabledFor: keyof UpdateUserRequest | undefined = undefined;
  editData: string = '';

  userResource = rxResource({
    request: () => this.reload$,
    loader: () => this.userService.getUserDetail(),
  });

  onClickEdit(fieldName: keyof UpdateUserRequest, data: string) {
    this.editData = data;
    this.editEnabledFor = fieldName;
  }

  onCancelEdit() {
    this.editEnabledFor = undefined;
    this.editData = '';
  }

  onSaveEdit(user: GetUserDetailResponse) {
    if(this.editEnabledFor && user[this.editEnabledFor]) {
      user[this.editEnabledFor] = this.editData;
      this.editEnabledFor = undefined;
      this.editData = '';
    }

    console.log('Saving', this.editEnabledFor, this.editData);
  }

  updateUserProfile() {
    const userId = 0;
    const tt = "string";

    // const jsonPatchDoc: JsonPatchDocument<UpdateUserRequest>[] = [
    //   { op: JsonPatchOperation.Replace, path: '/name', value: 'tt' },\
  }
}
