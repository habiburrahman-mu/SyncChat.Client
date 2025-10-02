import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {

  private userStore = new Map<number, string>();
  private userStore$ = new BehaviorSubject(this.userStore);

  constructor() { }

  getUser$(userId: number): Observable<string | undefined> {
    return this.userStore$.pipe(
      map(store => store.get(userId))
    );
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
