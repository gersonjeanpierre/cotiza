import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from '@core/models/order';
import { OrderService } from '@features/orders/service/order';
import { OrderIndexedDBService } from '@features/orders/service/order-idb';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-list-orders',
  imports: [CurrencyPipe, AsyncPipe, DatePipe],
  templateUrl: './list-orders.html',
  styleUrl: './list-orders.css'
})
export class ListOrders {

  private allOrders = new BehaviorSubject<Order[]>([]);
  orders = this.allOrders.asObservable();

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private orderIDBService: OrderIndexedDBService
  ) {

  }
  async ngOnInit(): Promise<void> {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.allOrders.next(orders);
        this.orderIDBService.saveAll(orders).then(() => {
          console.log('Orders saved to IndexedDB');
        }).catch((error) => {
          console.error('Error saving orders to IndexedDB:', error);
        });
        this.cdr.markForCheck();
        console.log('Orders:', this.allOrders.value);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  toInvoice(orderId: number): void {
    this.router.navigate([`/dashboard/pedidos/invoice/${orderId}`]);
  }

  generatePdf(orderId: number): void { }


}
