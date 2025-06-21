// src/app/features/product-types/components/product-type-list.component.ts
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ProductType } from '@core/models/product-type'; // Tu modelo ProductType
import { ProductTypeService } from '../../services/product-type'; // Tu servicio ProductType

@Component({
  selector: 'app-product-type-list', // Selector HTML para usar este componente
  standalone: true, // ¡Este es un componente Standalone!
  imports: [DatePipe], // Importa CommonModule para las directivas y pipes de Angular
  templateUrl: './product-type-list.html',
  styleUrl: './product-type-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // Mejora el rendimiento al evitar cambios innecesarios
})
export class ProductTypeList implements OnInit {
  productTypes: ProductType[] = []; // Array para almacenar los tipos de producto
  isLoading: boolean = true;      // Indicador de carga
  error: string | null = null;    // Mensaje de error

  constructor(private productTypeService: ProductTypeService,
    private cdr: ChangeDetectorRef, // Inyecta ChangeDetectorRef para detectar cambios manualmente
  ) { } // Inyección del servicio

  ngOnInit(): void {
    this.loadProductTypes(); // Carga los datos cuando el componente se inicializa
  }

  loadProductTypes(): void {
    this.error = null;
    this.isLoading = true;
    this.productTypeService.getAllProductTypes().subscribe({
      next: (data) => {
        this.productTypes = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // Notifica a Angular que los datos han cambiado
        console.log('Tipos de producto cargados:', this.productTypes);
      },
      error: (err) => {
        console.error('Error al cargar los tipos de producto:', err);
        // Puedes acceder a err.error para ver el detalle de error del backend si lo expone FastAPI
        this.error = 'No se pudieron cargar los tipos de producto. Por favor, inténtelo de nuevo más tarde.';
        this.isLoading = false;
        this.cdr.detectChanges(); // Notifica a Angular que hubo un error
      }
    });
  }
}