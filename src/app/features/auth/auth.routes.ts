import { Routes } from "@angular/router";
import { AUTH_ROUTE_PATH } from "@core/constants";

export const AUTH_ROUTES: Routes = [
  { path: AUTH_ROUTE_PATH.Login, loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent) },
  { path: AUTH_ROUTE_PATH.Register, loadComponent: () => import('./components/register/register.component').then(c => c.RegisterComponent) },
  { path: AUTH_ROUTE_PATH.ForgotPassword, loadComponent: () => import('./components/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent) },
  { path: AUTH_ROUTE_PATH.ResetPassword, loadComponent: () => import('./components/reset-password/reset-password.component').then(c => c.ResetPasswordComponent) },
  { path: '', pathMatch: 'full', redirectTo: AUTH_ROUTE_PATH.Login }
];
