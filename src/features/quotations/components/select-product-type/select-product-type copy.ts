// src/app/features/cotizacion/components/select-product-type.component.ts
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor
import { Router } from '@angular/router'; // Para la navegación programática

import { ProductType } from '@core/models/product-type'; // Nuestro modelo
import { ProductTypeService } from '@features/product-types/services/product-type'; // El servicio ya existente

@Component({
  selector: 'app-select-product-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-product-type.html',
  styleUrl: './select-product-type.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Recomendado con zoneless
})

export class SelectProductType implements OnInit {
  productTypes: ProductType[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  images = [{
    id: 1,
    path: '/images/gigantografia.webp'
  },
  {
    id: 2,
    path: '/images/vinil-blanco.webp'
  },
  ]

  constructor(
    private productTypeService: ProductTypeService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inyectamos ChangeDetectorRef para zoneless
  ) { }

  ngOnInit(): void {
    this.loadProductTypes();
  }

  loadProductTypes(): void {
    this.isLoading = true;
    this.error = null;
    this.productTypeService.getAllProductTypes().subscribe({
      next: (data) => {
        this.productTypes = data.map(pt => ({
          ...pt,
          path: this.images.find(img => img.id === pt.id)?.path || '/images/default-product.webp'
        }));
        this.isLoading = false;
        this.cdr.detectChanges(); // Notifica a Angular que los datos han cambiado
      },
      error: (err) => {
        console.error('Error al cargar los tipos de producto para selección:', err);
        this.error = 'No se pudieron cargar los tipos de producto. Inténtelo de nuevo más tarde.';
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar la detección de cambios
      }
    });
  }

  onSelectProductType(productType: ProductType): void {
    // Aquí puedes guardar el tipo de producto seleccionado en un servicio de cotización si es necesario
    // o simplemente navegar a la siguiente etapa, pasando el ID del tipo de producto.
    console.log('Tipo de producto seleccionado:', productType.name);
    this.router.navigate(['/dashboard/cotizaciones2/products', productType.id],); // Navega a la vista de productos
  }
}