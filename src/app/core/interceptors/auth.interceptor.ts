import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalStorageKey } from '@core/enums';
import { LocalStorageService } from '@core/services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageService = inject(LocalStorageService);

  const token = localStorageService.getItem<string | undefined>(LocalStorageKey.Token);

  if (token !== undefined) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    })
  }

  return next(req);
};
