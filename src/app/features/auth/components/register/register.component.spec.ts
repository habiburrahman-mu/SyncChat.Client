import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { AuthHttpService } from '@features/auth/services';
import { ToasterService } from '@core/services';
import { AnimationOptions, LottieComponent, provideLottieOptions } from 'ngx-lottie';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

const options: AnimationOptions = {
  path: 'assets/animations/register.json',
  loop: true,
  autoplay: true
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthHttpService>;
  let toasterServiceSpy: jasmine.SpyObj<ToasterService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthHttpService', ['register']);
    const toasterServiceSpy = jasmine.createSpyObj('ToasterService', ['success', 'invalidForm']);

    await TestBed.configureTestingModule({
      imports: [
        LottieComponent,
        RegisterComponent,
      ],
      providers: [
        { provide: AuthHttpService, useValue: authServiceSpy },
        { provide: ToasterService, useValue: toasterServiceSpy },
        provideLottieOptions({
          player: () => import('lottie-web'),
        }),
        { provide: ActivatedRoute, useValue: { params: of({}), snapshot: { paramMap: { get: () => null } } } },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
