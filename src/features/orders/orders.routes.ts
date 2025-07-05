import { Route } from "@angular/router";
import { Order } from "./components/order/order";

export const ORDERS_ROUTES: Route[] = [
  {
    path: '',
    component: Order
  }
]

export default ORDERS_ROUTES;