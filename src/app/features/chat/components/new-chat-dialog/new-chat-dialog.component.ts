import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface User {
  id: string;
  name: string;
}

@Component({
  selector: 'chat-new-chat-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './new-chat-dialog.component.html',
  styleUrl: './new-chat-dialog.component.scss',
})
export class NewChatDialogComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];
  searchText: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: User[] }
  ) {}

  ngOnInit() {
    this.users = this.data.users;
    this.filteredUsers = [...this.users];
  }

  filterUsers() {
    const query = this.searchText.toLowerCase().trim();
    this.filteredUsers = this.users.filter(
      (u) => u.name.toLowerCase().includes(query) && !this.selectedUsers.some((su) => su.id === u.id)
    );
  }

  selectUser(user: User) {
    this.selectedUsers.push(user);
    this.searchText = '';
    this.filterUsers();
  }

  removeUser(user: User) {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    this.filterUsers();
  }

  onCancel() {
    this.dialogRef.close();
  }

  onCreate() {
    this.dialogRef.close(this.selectedUsers);
  }
}
