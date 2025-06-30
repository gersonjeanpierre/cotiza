export interface Cart {
  id?: number;
  customer_id: number;
  total: number;
}

export interface CartItem {
  id?: number;
  cart_id: number;
  product_id: number;
  height: number | null;
  width: number | null;
  quantity: number;
  linear_meter: number | null;
}

export interface ProductExtraOption {
  id?: number;
  cart_item_id: number;
  extra_option_id: number;
  quantity: number;
  linear_meter?: number | null;
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