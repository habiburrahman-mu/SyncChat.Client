import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDetailInfoComponent } from './chat-detail-info.component';

describe('ChatDetailInfoComponent', () => {
  let component: ChatDetailInfoComponent;
  let fixture: ComponentFixture<ChatDetailInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDetailInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDetailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
