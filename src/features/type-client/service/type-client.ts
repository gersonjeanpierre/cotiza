import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '@env/env';
import { TypeClient } from '@core/models/type_client';

@Injectable({
  providedIn: 'root'
})
export class TypeClientService {
  private apiUrl = `${ENV.apiUrl}/type_clients`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<TypeClient[]> {
    return this.http.get<TypeClient[]>(this.apiUrl);
  }
}
