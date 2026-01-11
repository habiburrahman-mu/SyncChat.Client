import { inject, Injectable } from '@angular/core';
import { UserService } from '.';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  readonly userResource = rxResource({
    stream: () => this.userService.getUserDetail(),
  });

  constructor() {
    this.authService.isAuthenticated$
      .subscribe(isAuthenticated => {
        this.userResource.update(val => val = undefined);
      });
  }
}
