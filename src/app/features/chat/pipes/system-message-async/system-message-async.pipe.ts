import { inject, Pipe, PipeTransform } from '@angular/core';
import { UserStoreService } from '@core/services';
import { SYSTEM_MESSAGE_CONFIGS } from '@features/chat/configs/system-message.config';
import { combineLatest, map, Observable, of, startWith, switchMap, tap } from 'rxjs';

@Pipe({
  name: 'systemMessageAsync',
  pure: true
})
export class SystemMessageAsyncPipe implements PipeTransform {
  private userStoreService = inject(UserStoreService);

  transform(metaData: Record<string, any> | undefined | null): Observable<string> {
    if (!metaData || !metaData['Type']) return of('');

    const config = SYSTEM_MESSAGE_CONFIGS.find(c => c.type === metaData['Type']);
    if (!config) return of('');

    const actorIds = config.getActors(metaData);
    const targetIds = config.getTargets(metaData);

    const actor$ = actorIds.length
      ? combineLatest(actorIds.map(id =>
        this.userStoreService.getUserName$(id, true).pipe(startWith(undefined))
      ))
      : of([]);

    const target$ = targetIds.length
      ? combineLatest(targetIds.map(id =>
        this.userStoreService.getUserName$(id, true).pipe(startWith(undefined))
      ))
      : of([]);

    return combineLatest([actor$, target$]).pipe(
      map(([actorNames, targetNames]) =>
        config.format(actorNames, targetNames) // your config already handles fallbacks
      )
    );
  }
}

