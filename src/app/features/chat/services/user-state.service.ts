import { inject, Injectable } from '@angular/core';
import { UserService } from '.';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  readonly userResource = rxResource({
    stream: () => this.userService.getUserDetail().pipe(
      map(user => {
        if (user.avatarUrl) {
          user.avatarUrl = this.addTimeStampToUrl(user.avatarUrl);
        }

        return user;
      }),
    ),
  });

  constructor() {
    this.authService.isAuthenticated$
      .subscribe(isAuthenticated => {
        this.userResource.update(val => val = undefined);
      });
  }

  private addTimeStampToUrl(url: string): string {
    const timestamp = new Date().getTime();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${timestamp}`;
  }
}
