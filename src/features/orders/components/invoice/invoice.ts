import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '@core/models/order';
import { OrderIndexedDBService } from '@features/orders/service/order-idb';

@Component({
  selector: 'app-invoice',
  imports: [],
  templateUrl: './invoice.html',
  styleUrl: './invoice.css'
})
export class Invoice {

  orderId: number = 0;
  order: Order | null = null;

  constructor(
    private orderIDBService: OrderIndexedDBService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async params => {
      this.orderId = Number(params.get('orderId'))
      this.order = await this.orderIDBService.getById(this.orderId) || null;
      console.log('Order:', this.order);
    });
  }

}
