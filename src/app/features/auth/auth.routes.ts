import { Routes } from "@angular/router";
import { AUTH_ROUTE_PATH } from "@core/constants";

export const AUTH_ROUTES: Routes = [
  { path: AUTH_ROUTE_PATH.Login, loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent) },
  { path: AUTH_ROUTE_PATH.Register, loadComponent: () => import('./components/register/register.component').then(c => c.RegisterComponent) },
  { path: '', pathMatch: 'full', redirectTo: AUTH_ROUTE_PATH.Login }
];
