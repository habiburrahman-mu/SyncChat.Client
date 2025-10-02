import { Pipe, PipeTransform } from '@angular/core';
import { UserStoreService } from '@core/services';
import { UserService } from '@features/chat/services';
import { map, Observable, of, switchMap, tap } from 'rxjs';

@Pipe({
  name: 'userNameAsync'
})
export class UserNameAsyncPipe implements PipeTransform {
  constructor(
    private readonly userStoreService: UserStoreService,
    private readonly userService: UserService
  ) { }

  transform(userId: number): Observable<string | undefined> {
    return this.userStoreService.getUser$(userId).pipe(
      switchMap(name => {
        if (name) {
          return of(name);
        } else {
          return this.userService.getUserMetaData(userId).pipe(
            tap(user => {
              if (user) {
                this.userStoreService.setUsers([{ id: user.userId, name: user.name }]);
              }
            }),
            map(user => user.name)
          );
        }
      })
    );
  }

}
