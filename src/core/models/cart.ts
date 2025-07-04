import { Customer } from '@core/models/customer';

export interface Cart {
  id?: number;
  customer_id: number;
  customer: Customer;
  items?: CartItem[];
}


export interface CartItem {
  product_id: number;
  height: number | null;
  width: number | null;
  quantity: number;
  linear_meter: number | null;
  product_extra_options?: ProductExtraOption[];
}

export interface ProductExtraOption {
  extra_option_id: number;
  quantity: number | null;
  linear_meter?: number | null;
  width?: number | null;
  giga_select?: string | null;
}

export interface DisplayCartItem {

}