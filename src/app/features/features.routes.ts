import { Routes } from "@angular/router";
import { FEATURE_ROUTE_PATH } from "@core/constants";
import { authGuard } from "@core/guards";

export const FEATURE_ROUTES: Routes = [
  { path: FEATURE_ROUTE_PATH.Auth, loadChildren: () => import('@features/auth/auth.routes').then(r => r.AUTH_ROUTES) },
  {
    path: FEATURE_ROUTE_PATH.Chat,
    loadChildren: () => import('@features/chat/chat.routes').then(r => r.CHAT_ROUTES),
    canActivateChild: [authGuard]
   },
];
