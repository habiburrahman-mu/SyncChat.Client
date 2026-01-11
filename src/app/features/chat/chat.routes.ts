import { Routes } from "@angular/router";
import { CHAT_ROUTE_PATH } from "@core/constants";
import { mobileOnlyGuard } from "@core/guards";

export const CHAT_ROUTES: Routes = [
  {path: '', loadComponent: () => import('./components/chat/chat.component').then(c => c.ChatComponent)},
  {path: CHAT_ROUTE_PATH.List, canActivate: [mobileOnlyGuard], loadComponent: () => import('./components/chat-sidebar/chat-sidebar.component').then(c => c.ChatSidebarComponent)},
];
