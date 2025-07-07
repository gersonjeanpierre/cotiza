import { Route } from "@angular/router";
import { OrderNew } from "./components/order/order";
import { ListOrders } from "./components/list-orders/list-orders";
import { Invoice } from "./components/invoice/invoice";

export const ORDERS_ROUTES: Route[] = [
  {
    path: '',
    component: ListOrders
  },
  {
    path: 'nuevo/:orderId',
    component: OrderNew
  },
  {
    path: 'invoice/:orderId',
    component: Invoice
  }
]

export default ORDERS_ROUTES;