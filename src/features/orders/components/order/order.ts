import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DisplayCartItem, MyCart } from '@core/models/cart';
import { Order } from '@core/models/order';
import { OrderService } from '@features/orders/service/order';
import { MyCartIndexedDBService } from '@features/cart/service/my-cart-idb';

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
  profitMargin: number = 0;
  myCart: MyCart | null = null;


  displayMyCart: DisplayCartItem[] = [];

  order: Order | null = null;

  constructor(
    private orderService: OrderService,
    private myCartIBDService: MyCartIndexedDBService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    this.displayMyCart = state?.['displayMyCart'];
    this.totalAmount = state?.['totalAmount'] || 0;
    this.totalIgv = state?.['totalIgv'] || 0;
    this.finalAmount = state?.['finalAmount'] || 0;
    this.myCart = state?.['myCart'] || null;
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

  });


  ngOnInit() {
    console.log('Display My Cart:', this.displayMyCart);
  }

  saveOrder() {
    const orderPayload: Order = {
      customer_id: this.myCart?.customer_id || 0,
      store_id: 1,
      order_status_id: 1,
      total_amount: this.totalAmount,
      profit_margin: this.profitMargin,
      discount_applied: this.orderPayloadForm.value.discount_applied || 0,
      final_amount: this.finalAmount,
      payment_method: this.orderPayloadForm.value.payment_method || 'TRASFERENCIA BANCARIA',
      shipping_address: this.orderPayloadForm.value.shipping_address || 'No especificado',
      notes: this.orderPayloadForm.value.notes || 'No especificado',
      details: this.displayMyCart?.map(product => ({
        product_id: product.product_id,
        height: product.height || 1,
        width: product.width || 1,
        quantity: product.quantity || 1,
        linear_meter: product.linear_meter || 1,
        subtotal: product.subtotal,
        total_extra_options: product.total_extra_options,
        extra_options: product.extra_options?.map((extra: any) => ({
          extra_option_id: extra.extra_option_id || 0,
          quantity: extra.quantity || 1,
          linear_meter: extra.linear_meter || 1,
          width: extra.width,
          giga_select: extra.giga_select
        })) || []
      })) || []
    };
    if (this.orderPayloadForm.invalid) {
      this.orderPayloadForm.markAllAsTouched();
    }


    console.log('Display My Cart:', this.displayMyCart);
    this.order = orderPayload;

    this.orderService.createOrder(this.order).subscribe({
      next: (response) => {
        console.log('Order created successfully:', response);
        this.myCartIBDService.deleteMyCart(this.myCart?.id || 0);
        this.router.navigate(['/dashboard/pedidos']);
      },
      error: (error) => {
        console.error('Error creating order:', error);
      }
    });
  }

}
