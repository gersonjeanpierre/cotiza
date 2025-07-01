import { Route } from "@angular/router";
import { ProductList } from "@features/quotations/components/product-list/product-list";
import { SelectProductType } from "@features/quotations/components/select-product-type/select-product-type";
import { QuotationHome } from "./components/quotation-home/quotation-home";
import { ExtraOptionList } from "./components/extra-option-list/extra-option-list";

export const QUOTATIONS_ROUTES: Route[] = [
  {
    path: '',
    component: QuotationHome
  },
  {
    path: 'tiposdeproductos',
    component: SelectProductType
  },
  {
    path: 'tiposdeproductos/:productTypeName/:productTypeId',
    component: ProductList
  },
  {
    path: 'tiposdeproductos/:productTypeName/:productTypeId/:productId',
    component: ExtraOptionList
  }


];

export default QUOTATIONS_ROUTES;