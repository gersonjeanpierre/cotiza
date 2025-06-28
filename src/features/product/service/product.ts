// src/app/features/products/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '@env/env';
import { Product } from '@core/models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${ENV.apiUrl}/products`; // Endpoint de productos en FastAPI

  constructor(private http: HttpClient) { }

  /**
   * Obtiene productos, opcionalmente filtrados por tipo de producto.
   * Asume que tu API de FastAPI tiene un endpoint como /api/v1/products?product_type_id=X
   */
  // getProductsByProductTypeId(productTypeId: number): Observable<Product[]> {
  //   return this.http.get<Product[]>(`${this.apiUrl}?product_type_id=${productTypeId}`);
  // }

  // Puedes añadir otros métodos CRUD aquí más adelante si la característica 'products' los necesita
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

}