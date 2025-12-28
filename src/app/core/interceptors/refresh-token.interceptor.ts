import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalStorageKey } from '@core/enums';
import { AuthService, LocalStorageService } from '@core/services';
import { AuthHttpService } from '@features/auth/services';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

let isRefreshing: boolean = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authHttpService = inject(AuthHttpService);
  const localStorageService = inject(LocalStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authHttpService.refresh({
          deviceIdentifier: authService.getDeviceIdentifier()
        }).pipe(
          switchMap(accessToken => {
            isRefreshing = false;
            authService.setAuthState(true);
            localStorageService.setItem(LocalStorageKey.Token, accessToken);
            refreshTokenSubject.next(accessToken);

            return next(
              req.clone({
                headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
              })
            );
          }),
          catchError(err => {
            isRefreshing = false;
            authService.setAuthState(false);
            authService.logout();
            return throwError(() => err);
          })
        );
      }

      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(accessToken => {
          return next(
            req.clone({
              headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
            })
          );
        })
      );
    })
  );
};
