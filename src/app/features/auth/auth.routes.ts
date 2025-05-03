import { Routes } from "@angular/router";

const AUTH_ROUTE_PATH = {
  Login: 'login',
  Register: 'register'
};

export const AUTH_ROUTES: Routes = [
  { path: AUTH_ROUTE_PATH.Login, loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent) },
  { path: AUTH_ROUTE_PATH.Register, loadComponent: () => import('./components/register/register.component').then(c => c.RegisterComponent) },
  { path: '', pathMatch: 'full', redirectTo: AUTH_ROUTE_PATH.Login }
];
