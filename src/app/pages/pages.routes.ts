import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/components/home/home.component').then(c => c.HomeComponent)},
  { path: '**', loadComponent: () => import('./not-found/components/not-found/not-found.component').then(c => c.NotFoundComponent) }
];
