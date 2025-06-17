import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AUTH_ROUTE_PATH, FEATURE_ROUTE_PATH } from '@core/constants';
import { AuthService } from '@core/services';

export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken()) {
    return true;
  } else {
    router.navigate(['./', FEATURE_ROUTE_PATH.Auth, AUTH_ROUTE_PATH.Login]);
  }

  return true;
};
