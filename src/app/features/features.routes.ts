import { Routes } from "@angular/router";

export const FEATURE_ROUTES: Routes = [
  { path: 'auth', loadChildren: () => import('@features/auth/auth.routes').then(r => r.AUTH_ROUTES) },
  { path: 'chat', loadChildren: () => import('@features/chat/chat.routes').then(r => r.CHAT_ROUTES) },
];
