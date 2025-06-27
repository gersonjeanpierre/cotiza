// src/app/services/customer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CreateCustomerPayload } from '@core/models/customer';
import { ENV } from '@env/env';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${ENV.apiUrl}/customers`; // Asegúrate de que tu `environment.ts` tenga la URL del backend

  private typeClients = [
    {
      "id": 1,
      "code": "CFN",
      "name": "Cliente Final Nuevo",
      "margin": 0.5,
      "created_at": "2025-06-27T12:16:53.969996",
      "updated_at": "2025-06-27T12:16:53.969996",
      "deleted_at": null
    },
    {
      "id": 2,
      "code": "CFF",
      "name": "Cliente Final Frecuente",
      "margin": 0.3,
      "created_at": "2025-06-27T12:17:04.179261",
      "updated_at": "2025-06-27T12:17:04.179261",
      "deleted_at": null
    },
    {
      "id": 3,
      "code": "CIN",
      "name": "Cliente Imprentero Nuevo",
      "margin": 0.3,
      "created_at": "2025-06-27T12:17:13.412077",
      "updated_at": "2025-06-27T12:17:13.412077",
      "deleted_at": null
    },
    {
      "id": 4,
      "code": "CIF",
      "name": "Cliente Imprentero Frecuente",
      "margin": 0.15,
      "created_at": "2025-06-27T12:17:20.927681",
      "updated_at": "2025-06-27T12:17:20.927681",
      "deleted_at": null
    }
  ]

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: CreateCustomerPayload): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: number, customer: Partial<CreateCustomerPayload>): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTypeClients() {
    return this.typeClients;
  }
}