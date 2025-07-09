import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '@core/models/order';
import { ENV } from '@env/env';
import { DisplayCartItem } from '@core/models/cart';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
  private apiUrl = `${ENV.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }
  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }
  updateOrder(id: number, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
  }

  generateOrderPdf(orderId: number, items: DisplayCartItem[]): Observable<Blob> {
    const requestBody = { items: items };

    // Envía la solicitud POST y espera una respuesta de tipo 'blob'
    return this.http.post(`${this.apiUrl}/orders/${orderId}/generate-pdf`, requestBody, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'blob' // Importante para recibir el PDF como un blob
    });
  }
}
