import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FEATURE_ROUTE_PATH } from '@core/constants';
import { ChatStateService } from '@features/chat/services';

export const mobileOnlyGuard: CanActivateFn = (route, state) => {
  const chatStateService = inject(ChatStateService);
  const router = inject(Router);

  if (!chatStateService.isMobile()) {
    router.navigate([FEATURE_ROUTE_PATH.Chat]);
    return false;
  }

  return true;
};
