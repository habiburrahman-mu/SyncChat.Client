import { Routes } from '@angular/router';
import { FEATURE_ROUTES } from '@features/features.routes';
import { PAGES_ROUTES } from '@pages/pages.routes';

export const routes: Routes = [
  ...FEATURE_ROUTES,
  ...PAGES_ROUTES
];
