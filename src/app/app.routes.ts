import { Routes } from '@angular/router';
import { PAGES_ROUTES } from '@pages/pages.routes';

export const routes: Routes = [
  { path: 'chat', loadChildren: () => import('@features/chat/chat.routes').then(r => r.CHAT_ROUTES) },
  { path: 'auth', loadChildren: () => import('@features/auth/auth.routes').then(r => r.AUTH_ROUTES) },
  ...PAGES_ROUTES
];
