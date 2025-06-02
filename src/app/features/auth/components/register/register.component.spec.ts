import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { AuthHttpService } from '@features/auth/services';
import { ToasterService } from '@core/services';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
    const authSpy = jasmine.createSpyObj('AuthHttpService', ['register']);
    const toasterSpy = jasmine.createSpyObj('ToasterService', ['success', 'invalidForm']);

    await TestBed.configureTestingModule({
      imports: [
        LottieComponent,
        RegisterComponent,
      ],
      providers: [
        { provide: AuthHttpService, useValue: authSpy },
        { provide: ToasterService, useValue: toasterSpy },
        provideLottieOptions({
          player: () => import('lottie-web'),
        }),
        { provide: ActivatedRoute, useValue: { params: of({}), snapshot: { paramMap: { get: () => null } } } },
      ]
    })
      .compileComponents();

    authServiceSpy = TestBed.inject(AuthHttpService) as jasmine.SpyObj<AuthHttpService>;
    toasterServiceSpy = TestBed.inject(ToasterService) as jasmine.SpyObj<ToasterService>;
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
