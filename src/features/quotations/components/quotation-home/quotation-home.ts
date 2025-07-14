import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Tipo de cliente
import { TypeClientService } from '@features/type-client/service/type-client';
import { TypeClientIndexedDBService } from '@features/quotations/services/type-client-idb';
// Tipos de producto
import { ProductTypeService } from '@features/product-types/service/product-type';
import { ProductTypeIndexedDBService } from '@features/quotations/services/product-type-idb';
// Productos
import { ProductService } from '@features/product/service/product';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';

import { loadToIndexedDB } from '@shared/sync/dexie-db';
import { OrderStatusesService } from '@features/order-statuses/service/order-statuses';
import { OrderStatusesIndexedDBService } from '@features/orders/service/order-statuses-idb';

@Component({
  selector: 'app-quotation-home',
  imports: [],
  templateUrl: './quotation-home.html',
})
export class QuotationHome implements OnInit {
  title = 'Modulo de Cotizaciones';
  constructor(
    private router: Router,
    private productTypeService: ProductTypeService,
    private productTypeIDB: ProductTypeIndexedDBService,

    private productService: ProductService,
    private productsIDB: ProductIndexedDBService,

    private typeClientService: TypeClientService,
    private typeClientIDB: TypeClientIndexedDBService,

    private orderStatusesService: OrderStatusesService,
    private orderStatusesIDB: OrderStatusesIndexedDBService
  ) { }

  async ngOnInit(): Promise<void> {

    await loadToIndexedDB(this.productTypeIDB, this.productTypeService);
    await loadToIndexedDB(this.productsIDB, this.productService);
    await loadToIndexedDB(this.typeClientIDB, this.typeClientService);
    await loadToIndexedDB(this.orderStatusesIDB, this.orderStatusesService);

  }

  navigateToQuotation() {
    this.router.navigate(['/dashboard/cotizaciones/tiposdeproductos']);
  }
}
