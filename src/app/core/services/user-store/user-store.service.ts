import { Injectable } from '@angular/core';
import { UserService } from '@features/chat/services';
import { BehaviorSubject, map, Observable, of, shareReplay, tap } from 'rxjs';
import { AuthService } from '..';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {

  private userStore = new Map<number, string>();
  private userRequests = new Map<number, Observable<string>>();
  private userStore$ = new BehaviorSubject(this.userStore);

  constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

  getUserName$(userId: number, currentUserAsYou = false): Observable<string> {
    if(currentUserAsYou && userId === this.authService.userId) {
      return of('You');
    }

    // Return from cache if available
    if (this.userStore.has(userId)) {
      return of(this.userStore.get(userId)!);
    }

    // Return ongoing request if already fetching
    if (this.userRequests.has(userId)) {
      return this.userRequests.get(userId)!;
    }

    // Fetch from API, store in cache, and share result
    const request$ = this.userService.getUserMetaData(userId).pipe(
      tap(user => {
        this.setUsers([{ id: user.userId, name: user.name }]);
        this.userRequests.delete(userId);
      }),
      map(user => user.name),
      shareReplay(1)
    );

    this.userRequests.set(userId, request$);
    return request$;
  }

  setUsers(users: { id: number; name: string }[]): void {
    let hasChanged = false;

    for (const u of users) {
      const existing = this.userStore.get(u.id);

      // Only set and mark as changed if new or updated
      if (!existing || existing !== u.name) {
        this.userStore.set(u.id, u.name);
        hasChanged = true;
      }
    }

    // Only emit if something really changed
    if (hasChanged) {
      this.userStore$.next(new Map(this.userStore));
    }
  }

}
