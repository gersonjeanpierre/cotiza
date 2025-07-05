import { Route } from "@angular/router";
import { Order } from "./components/order/order";
import { ListOrders } from "./components/list-orders/list-orders";
import { Invoice } from "./components/invoice/invoice";

export const ORDERS_ROUTES: Route[] = [
  {
    path: '',
    component: ListOrders
  },
  {
    path: 'nuevo/:orderId',
    component: Order
  },
  {
    path: 'invoice/:orderId',
    component: Invoice
  }
]

export default ORDERS_ROUTES;