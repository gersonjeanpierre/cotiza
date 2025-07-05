import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartIndexedDBService } from '@features/quotations/services/cart-idb';

@Component({
  selector: 'app-order',
  imports: [CurrencyPipe],
  templateUrl: './order.html',
  styleUrl: './order.css'
})
export class Order {

  totalAmount: number = 0;
  totalIgv: number = 0;
  finalAmount: number = 0;

  constructor(
    private cartIDBService: CartIndexedDBService,
    private router: Router
  ) {

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    const displayCart = state?.['displayCart'];
    this.totalAmount = state?.['totalAmount'] || 0;
    this.totalIgv = state?.['totalIgv'] || 0;
    this.finalAmount = state?.['finalAmount'] || 0;

    console.log('Display Cart:', displayCart);

  }

  ngOnInit() {
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