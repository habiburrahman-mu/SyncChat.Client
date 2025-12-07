import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConversationMemberDTO } from '@features/chat/models';
import { ChatStateService, ConversationMemberService } from '@features/chat/services';
import { MemberRole } from '@core/enums';
import { AuthService } from '@core/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'chat-member-action-dialog',
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './member-action-dialog.component.html',
  styleUrl: './member-action-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberActionDialogComponent implements OnInit {
  private readonly chatStateService = inject(ChatStateService);
  private readonly dialogRef = inject(MatDialogRef<MemberActionDialogComponent, ConversationMemberDTO>);
  public readonly member = inject(MAT_DIALOG_DATA) as ConversationMemberDTO;
  private readonly authService = inject(AuthService);
  private readonly conversationMemberService = inject(ConversationMemberService);
  private readonly destroyRef = inject(DestroyRef);

  readonly MemberRole = MemberRole;

  loadingAdmin = signal<boolean>(false);
  loadingOwner = signal<boolean>(false);
  loadingDismiss = signal<boolean>(false);
  loadingRemove = signal<boolean>(false);

  readonly currentUserId = this.authService.userId;
  readonly isCurrentUser = this.currentUserId === this.member.userID;


  ngOnInit(): void {
    const conversationMemberList = this.chatStateService.conversationMemberList();
  }

  disableAction = computed(() => {
    return this.loadingAdmin() || this.loadingOwner() || this.loadingDismiss() || this.loadingRemove();
  });

  makeAdmin() {
    this.loadingAdmin.set(true);
    this.conversationMemberService.makeAdmin(this.member.conversationMemberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: _ => {
          this.loadingAdmin.set(false);
          this.dialogRef.close();
        },
        error: err => {
          this.loadingAdmin.set(false);
        }
      });
  }

  makeOwner() {
    this.loadingOwner.set(true);
    setTimeout(() => this.loadingOwner.set(false), 1500);
  }

  dismissAdmin() {
    this.loadingDismiss.set(true);
    this.conversationMemberService.removeAdminStatus(this.member.conversationMemberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: _ => {
          this.loadingDismiss.set(false);
          this.dialogRef.close();
        },
        error: err => {
          this.loadingDismiss.set(false);
        }
      });
  }

  removeMember() {
    this.loadingRemove.set(true);
    // todo: add confirmation
    this.conversationMemberService.remove(this.member.conversationMemberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: _ => {
          this.loadingRemove.set(false);
          this.dialogRef.close();
        },
        error: err => {
          this.loadingRemove.set(false);
        }
      });
  }


}
