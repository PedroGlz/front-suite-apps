import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginPage) },
  { path: 'apps', canActivate: [authGuard], loadComponent: () => import('./pages/apps/apps').then(m => m.AppsPage) },
  { path: 'apps/:id', canActivate: [authGuard], loadComponent: () => import('./pages/app-detail/app-detail').then(m => m.AppDetailPage) },
  { path: '', pathMatch: 'full', redirectTo: 'apps' },
  { path: '**', redirectTo: 'apps' }
];
