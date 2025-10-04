import { ChangeDetectionStrategy, Component, computed, Inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConversationMemberDTO } from '@features/chat/models';
import { ChatStateService } from '@features/chat/services';
import { NgIf } from "../../../../../../../../node_modules/@angular/common/common_module.d-C8_X2MOZ";
import { MemberRole } from '@core/enums';

@Component({
  selector: 'chat-member-action-dialog',
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
],
  templateUrl: './member-action-dialog.component.html',
  styleUrl: './member-action-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberActionDialogComponent implements OnInit {
  readonly MemberRole = MemberRole;

  loadingAdmin = signal<boolean>(false);
  loadingOwner = signal<boolean>(false);
  loadingDismiss = signal<boolean>(false);
  loadingRemove = signal<boolean>(false);

  constructor(
    private readonly chatStateService: ChatStateService,
    private readonly dialogRef: MatDialogRef<MemberActionDialogComponent, ConversationMemberDTO>,
    @Inject(MAT_DIALOG_DATA) public member: ConversationMemberDTO) { }

  ngOnInit(): void {
    const conversationMemberList = this.chatStateService.conversationMemberList();
  }

  disableAction = computed(() => {
    return this.loadingAdmin() || this.loadingOwner() || this.loadingDismiss() || this.loadingRemove();
  });

  makeAdmin() {
    this.loadingAdmin.set(true);
    setTimeout(() => this.loadingAdmin.set(false), 2000);
  }

  makeOwner() {
    this.loadingOwner.set(true);
    setTimeout(() => this.loadingOwner.set(false), 1500);
  }

  dismissAdmin() {
    this.loadingDismiss.set(true);
    setTimeout(() => this.loadingDismiss.set(false), 1500);
  }

  removeMember() {
    this.loadingRemove.set(true);
    setTimeout(() => this.loadingRemove.set(false), 1500);
  }


}
