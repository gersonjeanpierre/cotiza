import { Routes } from '@angular/router';
import { DashboardLayout } from './components/dashboard-layout/dashboard-layout';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';

export const dashboardRoutes: Routes = [

  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '', redirectTo: 'overview', pathMatch: 'full'
      },
      {
        path: 'overview', component: DashboardPage
      },
      {
        path: 'quotation',
        loadChildren: () => import('../product-quotation/product-quotation.routes')
      }
    ]
  },

]
export default dashboardRoutes; 