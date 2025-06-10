import { Routes} from "@angular/router";
import { ProductList } from "./product-list/product-list";
import { ExtraOption } from "./extra-option/extra-option";

export const productQuotationRoutes: Routes = [

  {
    path: '',
    component: ProductList
  },
  {
    path: ':url',
    component: ExtraOption
  }

]

export default productQuotationRoutes;