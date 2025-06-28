
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Necesario para trabajar con Observables
import { ENV } from '@env/env'; // Para la URL base del API
import { ProductType } from '@core/models/product-type'; // Tu modelo ProductType

@Injectable({
  providedIn: 'root' // Hace que este servicio sea un singleton y esté disponible en toda la app
})
export class ProductTypeService {
  private apiUrl = `${ENV.apiUrl}/product_types`; // Construye la URL base del API

  constructor(private http: HttpClient) { } // Inyecta HttpClient

  /**
   * Obtiene todos los tipos de producto desde el API.
   * @param skip Número de elementos a omitir (para paginación).
   * @param limit Número máximo de elementos a devolver (para paginación).
   * @returns Un Observable que emite un array de ProductType.
   */
  getAll(skip: number = 0, limit: number = 100): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(`${this.apiUrl}?skip=${skip}&limit=${limit}`);
  }
}