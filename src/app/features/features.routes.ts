import { Routes } from "@angular/router";

export const FEATURE_ROUTE_PATH = {
  Auth: 'auth',
  Chat: 'chat'
}

export const FEATURE_ROUTES: Routes = [
  { path: FEATURE_ROUTE_PATH.Auth, loadChildren: () => import('@features/auth/auth.routes').then(r => r.AUTH_ROUTES) },
  { path: FEATURE_ROUTE_PATH.Chat, loadChildren: () => import('@features/chat/chat.routes').then(r => r.CHAT_ROUTES) },
];
