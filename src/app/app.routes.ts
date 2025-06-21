import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', redirectTo: 'dashboard', pathMatch: 'full'
  },

  {
    path: 'dashboard', loadChildren: () => import('../features/dashboard/dashboard.routes')
  },

  {
    path: "**", redirectTo: '',
  }
];
