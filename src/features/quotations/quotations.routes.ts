import { Route } from "@angular/router";
import { ProductTypeList } from "../product-types/components/product-type-list/product-type-list";

export const QUOTATIONS_ROUTES: Route[] = [
  {
    path: '',
    component: ProductTypeList
  }
];

export default QUOTATIONS_ROUTES;