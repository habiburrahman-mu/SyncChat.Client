import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAddMemberDialogComponent } from './chat-add-member-dialog.component';

describe('ChatAddMemberDialogComponent', () => {
  let component: ChatAddMemberDialogComponent;
  let fixture: ComponentFixture<ChatAddMemberDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatAddMemberDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatAddMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
