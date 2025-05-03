import { Routes } from "@angular/router";

export const CHAT_ROUTES: Routes = [
  {path: '', loadComponent: () => import('./components/chat/chat.component').then(c => c.ChatComponent)}
];
