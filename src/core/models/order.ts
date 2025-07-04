export interface Order {
  id?: number;
  customer_id: number;
  store_id: number;
  order_status_id: number;
  total_amount: number;
  profit_margin: number;
  discount_applied?: number;
  final_amount: number;
  payment_method: string;
  shipping_address?: string;
  notes?: string;
  details?: Details[];
}

export interface Details {
  product_id: number;
  height: number;
  width: number;
  quantity: number;
  linear_meter?: number | null;
  extra_options?: DetailExtraOption[];
}

export interface DetailExtraOption {
  extra_option_id: number;
  quantity?: number;
  linear_meter?: number | null;
  width?: number | null;
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