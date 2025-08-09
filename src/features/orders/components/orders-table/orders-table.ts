import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Order } from '@core/models/order';
import { Observable } from 'rxjs';
import { getColorStatus } from '@shared/utils/orderUtils'; // Asegúrate de que esta utilidad esté disponible o muévela

@Component({
  selector: 'app-orders-table',
  standalone: true, // Importante: marcamos como standalone
  imports: [AsyncPipe, CurrencyPipe, DatePipe],
  templateUrl: './orders-table.html',
  styleUrls: ['./orders-table.css']
})
export class OrdersTable {
  @Input() orders!: Observable<Order[]>;
  @Input() hasTriedLoad!: boolean; // Ya no es un signal, es un boolean directo
  @Input() errorMessage!: string | null;

  @Output() editOrder = new EventEmitter<number>();
  @Output() generatePdf = new EventEmitter<Order>();

  public getColorStatus = getColorStatus; // Expón la función para usarla en la plantilla

  constructor() { }

  onEditOrder(orderId: number): void {
    this.editOrder.emit(orderId);
  }

  onGeneratePdf(order: Order): void {
    this.generatePdf.emit(order);
  }
}