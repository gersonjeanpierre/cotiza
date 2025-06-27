import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductType } from '@core/models/product-type';
import { ProductTypeService } from '@features/product-types/services/product-type';
import { ProductTypeIndexedDBService } from '@features/quotations/services/product-type-idb';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { TypeClientIndexedDBService } from '@features/quotations/services/type-client-idb';

@Component({
  selector: 'app-quotation-home',
  imports: [],
  templateUrl: './quotation-home.html',
  styleUrl: './quotation-home.css'
})
export class QuotationHome implements OnInit {
  title = 'Quotation Home';
  constructor(
    private router: Router,
    private productTypeService: ProductTypeService,
    private productTypeIDB: ProductTypeIndexedDBService,
    private typeClientIDB: TypeClientIndexedDBService,
    private productsIDB: ProductIndexedDBService
  ) { }

  async ngOnInit(): Promise<void> {
    // Cargar tipos de producto en IndexedDB
    await this.cargarTiposDeProductoEnIndexedDB();
    console.log('Tipos de producto cargados en IndexedDB', this.productTypeIDB.getProductTypes());
  }

  async cargarTiposDeProductoEnIndexedDB(): Promise<void> {
    this.productTypeService.getAllProductTypes().subscribe({
      next: async (data) => {
        await this.productTypeIDB.saveProductTypes(data);
      },
      error: (error) => {
        console.error('Error al cargar tipos de producto:', error);

      }
    })
  }

  navigateToQuotation() {
    this.router.navigate(['/dashboard/cotizaciones/tiposdeproductos']);
  }
}
