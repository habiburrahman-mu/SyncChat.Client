import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDetailMembersComponent } from './chat-detail-members.component';

describe('ChatDetailMembersComponent', () => {
  let component: ChatDetailMembersComponent;
  let fixture: ComponentFixture<ChatDetailMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDetailMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDetailMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
