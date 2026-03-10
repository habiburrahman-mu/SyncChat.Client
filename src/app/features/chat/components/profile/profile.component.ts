import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, ToasterService } from '@core/services';
import { GetUserDetailResponse, UpdateUserRequest } from '@features/chat/models';
import { UserStateService } from '@features/chat/services';
import { UserService } from '@features/chat/services/user.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'chat-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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

  readonly previewImage = signal<string | undefined>(undefined);
  readonly savedLocalPhoto = signal<string | undefined>(undefined);
  readonly photoModalOpen = signal(false);

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

  onEnter(input: NgModel, user: GetUserDetailResponse) {
    if (input.valid) {
      this.onSaveEdit(user);
    }
  }

  onSaveEdit(user: GetUserDetailResponse) {
    if (this.editEnabledFor && user[this.editEnabledFor] !== undefined) {
      if (this.editData === '') {
        this.editData = undefined;
      }

      this.updateUser(user);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  onSavePhoto() {
    const preview = this.previewImage();
    if (!preview) return;

    this.savedLocalPhoto.set(preview);
    this.previewImage.set(undefined);
    this.photoModalOpen.set(false);
  }

  onCancelPhoto() {
    this.previewImage.set(undefined);
    this.photoModalOpen.set(false);
  }

  openPhotoModal(user?: GetUserDetailResponse) {
    const current = this.savedLocalPhoto() || (user as any)?.avatarUrl;
    this.previewImage.set(current);
    this.photoModalOpen.set(true);
  }

  closePhotoModal() {
    this.previewImage.set(undefined);
    this.photoModalOpen.set(false);
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
