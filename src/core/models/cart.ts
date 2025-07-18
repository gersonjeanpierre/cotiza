import { Customer } from '@core/models/customer';

export interface MyCart {
  id?: number;
  customer_id: number;
  customer?: Customer;
  store_id: number;
  order_status_id: number | null;
  total_amount: number;
  profit_margin: number;
  discount_applied: number | 0;
  final_amount: number;
  payment_method: string | null;
  shipping_address: string | null;
  notes: string | null;
  details: MyCartDetail[];
}
export interface MyCartDetail {
  product_id: number;
  height: number;
  width: number;
  quantity: number;
  linear_meter: number;
  subtotal: number;
  total_extra_options: number;
  extra_options: MyCartDetailExtraOption[];
}
export interface DisplayCartItem extends MyCartDetail {
  sku: string;
  name: string;
  price: number;
  image: string;
  extra_options: DisplayProductExtraOption[];
}

export interface MyCartDetailExtraOption {
  extra_option_id: number;
  quantity: number;
  linear_meter: number | null;
  width: number | null;
  giga_select: string | null;
}
export interface DisplayProductExtraOption extends MyCartDetailExtraOption {
  name: string;
  price: number;
}