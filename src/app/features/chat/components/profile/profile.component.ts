import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, resource, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService, ToasterService } from '@core/services';
import { GetUserDetailResponse, UpdateUserRequest } from '@features/chat/models';
import { UserStateService } from '@features/chat/services';
import { UserService } from '@features/chat/services/user.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'chat-profile',
  imports: [
    CommonModule,
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
  private readonly userStateService = inject(UserStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toasterService = inject(ToasterService);

  private readonly currentUserId = this.authService.userId;
  readonly saveInProgress = signal(false);

  editEnabledFor: keyof UpdateUserRequest | undefined = undefined;
  editData: string | undefined = '';

  userResource = this.userStateService.userResource;

  onClickEdit(fieldName: keyof UpdateUserRequest, data: string | undefined) {
    this.editData = data;
    this.editEnabledFor = fieldName;
  }

  onCancelEdit() {
    this.editEnabledFor = undefined;
    this.editData = '';
  }

  onSaveEdit(user: GetUserDetailResponse) {
    if (this.editEnabledFor && user[this.editEnabledFor] !== undefined) {
      this.updateUser(user);
    }
  }

  updateUser(user: GetUserDetailResponse) {
    this.saveInProgress.set(true);

    const request: UpdateUserRequest = {
      email: user.email,
      name: user.name,
      phone: user.phone,
    };

    request[this.editEnabledFor!] = this.editData!;

    this.userService.update(this.currentUserId!, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saveInProgress.set(false);
          this.userResource.reload();

          user[this.editEnabledFor!] = this.editData!;

          this.editEnabledFor = undefined;
          this.editData = '';
        },
        error: (err) => {
          this.saveInProgress.set(false);
        }
      });
  }

  updateUserProfile() {
    const userId = 0;
    const tt = "string";

    // const jsonPatchDoc: JsonPatchDocument<UpdateUserRequest>[] = [
    //   { op: JsonPatchOperation.Replace, path: '/name', value: 'tt' },\
  }
}
