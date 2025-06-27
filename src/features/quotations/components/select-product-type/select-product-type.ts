// src/app/features/cotizacion/components/select-product-type.component.ts
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor
import { ActivatedRoute, Router } from '@angular/router'; // Para la navegación programática

import { ProductType } from '@core/models/product-type'; // Nuestro modelo
import { ProductTypeService } from '@features/product-types/services/product-type'; // El servicio ya existente
import { ProductTypeIndexedDBService } from '@features/quotations/services/product-type-idb';

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

  productTypeName: string | null = null;

  images = [{
    id: 1,
    path: '/images/gigantografia.webp'
  },
  {
    id: 2,
    path: '/images/vinil-blanco.webp'
  },
  ]

  allProductTypes: ProductType[] = [];
  constructor(
    private productTypeService: ProductTypeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private indexedDBService: ProductTypeIndexedDBService
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      const id = params.get('productTypeId');
      const url = params.get('productTypeName');
      console.log('ID del tipo de producto:', id);
      console.log('Nombre del tipo de producto:', url);
    });
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

  async syncProductTypesIfNeeded(): Promise<void> {
    const lastSync = await this.indexedDBService.getLastSync();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const lastSyncDay = lastSync?.slice(0, 10);

    if (lastSyncDay !== today) {
      // Sincroniza con la API y guarda en indexedDB
      this.productTypeService.getAllProductTypes().subscribe({
        next: async (data) => {
          await this.indexedDBService.saveProductTypes(data);
        }
      });
    }
    console.log('Sincronización de tipos de producto completada.');
    console.log('types', this.indexedDBService.getProductTypes());
  }

  onSelectProductType(productType: ProductType): void {
    const name = productType.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    this.router.navigate([`/dashboard/cotizaciones/tiposdeproductos/${name}`, productType.id]);
  }
}