import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomToasterComponent } from './custom-toaster.component';

describe('CustomToasterComponent', () => {
  let component: CustomToasterComponent;
  let fixture: ComponentFixture<CustomToasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomToasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomToasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
