import { Customer } from "@core/models/customer";
import { OrderStatus } from "@core/models/order-status";
import { Store } from "@core/models/store";

export interface Order {
  id?: number;
  customer_id: number;
  store_id: number;
  order_status_id: number;
  total_amount: number;
  profit_margin: number;
  discount_applied: number | 0;
  final_amount: number;
  payment_method: string;
  shipping_address: string | null;
  notes: string | null;
  details: Details[];
  created_at?: Date;
  status?: OrderStatus; // Es un objeto de OrderStatuses
  customer?: Customer; // Es un objeto de Customers
  store?: Store // Es un objeto de Store
}

export interface Details {
  product_id: number;
  height: number;
  width: number;
  quantity: number;
  linear_meter: number;
  subtotal: number;
  total_extra_options: number;
  extra_options: DetailExtraOption[];
}

export interface DetailExtraOption {
  extra_option_id: number;
  quantity: number;
  linear_meter: number | null;
  width: number | null;
  giga_select: string | null;
}

const okay = {
  "customer_id": 0,
  "store_id": 0,
  "order_status_id": 0,
  "total_amount": 1,
  "profit_margin": 0,
  "discount_applied": 0,
  "final_amount": 1,
  "payment_method": "string",
  "shipping_address": "string",
  "notes": "string",
  "details": [
    {
      "product_id": 0,
      "height": 1,
      "width": 1,
      "quantity": 1,
      "linear_meter": 1,
      "subtotal": 1,
      "total_extra_options": 1,
      "extra_options": [
        {
          "extra_option_id": 0,
          "quantity": 1,
          "linear_meter": 1,
          "width": 1,
          "giga_select": "string"
        }
      ]
    }
  ]
}

const order_example = {
  "customer_id": 1,
  "store_id": 1,
  "order_status_id": 1,
  "total_amount": 150.00,
  "profit_margin": 30.00,
  "discount_applied": 15.00,
  "final_amount": 165.00,
  "payment_method": "Tarjeta de Crédito",
  "shipping_address": "Av. Los Rosales 123, Santiago de Surco, Lima",
  "notes": "Cliente solicita entrega en la tarde.",
  "details": [
    {
      "product_id": 1,
      "height": 1.5,
      "width": 2.0,
      "quantity": 1,
      "linear_meter": 3.5,
      "extra_options": [
        {
          "extra_option_id": 1,
          "quantity": 1,
          "linear_meter": 2.5
        },
        {
          "extra_option_id": 2,
          "quantity": 2
        }
      ]
    },
    {
      "product_id": 2,
      "height": 0.5,
      "width": 1.0,
      "quantity": 2,
      "linear_meter": null,
      "extra_options": []
    }
  ]
}