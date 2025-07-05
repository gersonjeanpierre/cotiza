import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '@env/env';
import { OrderStatus } from '@core/models/order-status';

@Injectable({
  providedIn: 'root'
})
export class OrderStatusesService {
  private apiUrl = `${ENV.apiUrl}/order_statuses`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<OrderStatus[]> {
    return this.http.get<OrderStatus[]>(this.apiUrl);
  }

  getOrderStatusById(id: number): Observable<OrderStatus> {
    return this.http.get<OrderStatus>(`${this.apiUrl}/${id}`);
  }

}
