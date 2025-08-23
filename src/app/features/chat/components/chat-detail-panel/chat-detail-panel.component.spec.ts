import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDetailPanelComponent } from './chat-detail-panel.component';

describe('ChatDetailPanelComponent', () => {
  let component: ChatDetailPanelComponent;
  let fixture: ComponentFixture<ChatDetailPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDetailPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
