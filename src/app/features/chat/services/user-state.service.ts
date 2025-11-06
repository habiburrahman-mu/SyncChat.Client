import { inject, Injectable } from '@angular/core';
import { UserService } from '.';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private readonly userService = inject(UserService);

  readonly userResource = rxResource({
    stream: () => this.userService.getUserDetail(),
  });
}
