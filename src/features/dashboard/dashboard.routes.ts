import { Routes } from '@angular/router';
import { DashboardLayout } from './components/dashboard-layout/dashboard-layout';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';

export const dashboardRoutes: Routes = [

  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '', redirectTo: 'cotizaciones', pathMatch: 'full'
      },
      {
        path: 'overview', component: DashboardPage
      },
      {
        path: 'cotizaciones',
        loadChildren: () => import('../quotations/quotations.routes')
      },
      {
        path: 'pedidos',
        loadChildren: () => import('../orders/orders.routes')
      },
    ]
  },

]
export default dashboardRoutes; 