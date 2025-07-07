import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartIndexedDBService } from '@features/quotations/services/cart-idb';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Cart } from '@core/models/cart';
import { Order } from '@core/models/order';

@Component({
  selector: 'app-order',
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './order.html',
  styleUrl: './order.css'
})
export class OrderNew {

  totalAmount: number = 0;
  totalIgv: number = 0;
  finalAmount: number = 0;
  cart: Cart | null = null;

  displayCart: any[] = [];

  order: Order | null = null;

  constructor(
    private cartIDBService: CartIndexedDBService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    this.displayCart = state?.['displayCart'];
    this.totalAmount = state?.['totalAmount'] || 0;
    this.totalIgv = state?.['totalIgv'] || 0;
    this.finalAmount = state?.['finalAmount'] || 0;
    this.cart = state?.['cart'] || null;

    console.log('Display Cart:', this.cart?.customer.type_client.margin);

  }

  private formBuilder = inject(FormBuilder);

  orderPayloadForm = this.formBuilder.group({
    customer_id: this.formBuilder.control<number>(0),
    store_id: this.formBuilder.control<number>(0), // Default to 1
    order_status_id: this.formBuilder.control<number>(0),
    total_amount: this.formBuilder.control<number>(0),
    profit_margin: this.formBuilder.control<number>(0),
    discount_applied: this.formBuilder.control<number>(0),
    final_amount: this.formBuilder.control<number>(0),
    payment_method: this.formBuilder.control<string>(''),
    shipping_address: this.formBuilder.control<string | null>(null),
    notes: this.formBuilder.control<string | null>(null),
    details: this.formBuilder.group({
      product_id: this.formBuilder.control<number>(1),
      height: this.formBuilder.control<number>(1),
      width: this.formBuilder.control<number>(1),
      quantity: this.formBuilder.control<number>(1),
      linear_meter: this.formBuilder.control<number>(1),
      extra_options: this.formBuilder.group({
        extra_option_id: this.formBuilder.control<number>(0),
        quantity: this.formBuilder.control<number | null>(null),
        linear_meter: this.formBuilder.control<number | null>(null),
        width: this.formBuilder.control<number | null>(null)
      })
    })

  })

  ngOnInit() {
    console.log('Order Payload Form:', this.orderPayloadForm.value);
    this.order = this.orderPayloadForm.value as Order;
    console.log('Order:', this.order);
  }

  saveOrder() {
    const orderPayload: Order = {
      customer_id: this.cart?.customer_id || 0,
      store_id: 1,
      order_status_id: 1,
      total_amount: this.orderPayloadForm.value.total_amount || 0,
      profit_margin: this.orderPayloadForm.value.profit_margin || 0,
      discount_applied: this.orderPayloadForm.value.discount_applied || 0,
      final_amount: this.orderPayloadForm.value.final_amount || 0,
      payment_method: this.orderPayloadForm.value.payment_method || 'TRASFERENCIA BANCARIA',
      shipping_address: this.orderPayloadForm.value.shipping_address || 'No especificado',
      notes: this.orderPayloadForm.value.notes || 'No especificado',
      details: this.cart?.items?.map(item => ({
        product_id: item.product_id,
        height: item.height || 1,
        width: item.width || 1,
        quantity: item.quantity || 1,
        linear_meter: item.linear_meter || 1,
        subtotal: 0,
        total_extra_options: 0,
        extra_options: item.product_extra_options?.map((extra: any) => ({
          extra_option_id: extra.extra_option_id || 0,
          quantity: extra.quantity || 1,
          linear_meter: extra.linear_meter || 1,
          width: extra.width || 1,
          giga_select: extra.giga_select || null
        })) || []
      })) || []
    };

    this.order = orderPayload;
    console.log('Order  this:', this.order);
  }

}

const a = {
  "customer_id": 0,
  "store_id": 0, //  igual a 1
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
      "extra_options": [
        {
          "extra_option_id": 0,
          "quantity": 1,
          "linear_meter": 1,
          "width": 1
        }
      ]
    }
  ]
}