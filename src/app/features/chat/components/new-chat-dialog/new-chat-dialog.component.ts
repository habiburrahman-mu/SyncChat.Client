import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

export interface User {
  id: string;
  name: string;
}

@Component({
  selector: 'chat-new-chat-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    MatListModule,
    MatButtonModule
  ],
  templateUrl: './new-chat-dialog.component.html',
  styleUrl: './new-chat-dialog.component.scss'
})
export class NewChatDialogComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchText: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: User[] }
  ) { }

  ngOnInit() {
    this.users = this.data.users;
    this.filteredUsers = [...this.users];
  }

  filterUsers() {
    const query = this.searchText.toLowerCase().trim();
    this.filteredUsers = this.users.filter(u => u.name.toLowerCase().includes(query));
  }

  isUserSelected(user: User): boolean {
    // optionally disable already added users here if needed
    return false;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onCreate(selected: { value: User }[]) {
    const selectedUsers = selected.map(s => s.value);
    this.dialogRef.close(selectedUsers);
  }
}
