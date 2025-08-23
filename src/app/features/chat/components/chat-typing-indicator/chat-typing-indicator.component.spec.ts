import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatTypingIndicatorComponent } from './chat-typing-indicator.component';

describe('ChatTypingIndicatorComponent', () => {
  let component: ChatTypingIndicatorComponent;
  let fixture: ComponentFixture<ChatTypingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatTypingIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatTypingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
