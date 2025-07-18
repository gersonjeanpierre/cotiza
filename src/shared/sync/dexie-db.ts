import { MyCart } from '@core/models/cart';
import { Order } from '@core/models/order';
import { OrderStatus } from '@core/models/order-status';
import { Product } from '@core/models/product';
import { ProductType } from '@core/models/product-type';
import { TypeClient } from '@core/models/type_client';
import Dexie, { EntityTable } from 'dexie';

export class CotizaDB extends Dexie {
  type_clients!: EntityTable<TypeClient, 'id'>;
  products!: EntityTable<Product, 'id'>;
  product_type!: EntityTable<ProductType, 'id'>;
  order_statuses!: EntityTable<OrderStatus, 'id'>;
  my_cart!: EntityTable<MyCart, 'id'>;
  order!: EntityTable<Order, 'id'>;

  constructor() {
    super('CotizaDB');
    this.version(1).stores({
      type_clients: '++id,code',
      products: '++id, sku',
      product_type: '++id, name',
      order_statuses: '++id, code',
      my_cart: '++id, customer_id',
      order: '++id, customer_id, store_id, order_status_id',
    });
  }
}

interface ApiService<T> {
  getAll: () => {
    subscribe: (observer: {
      next: (data: T[]) => void;
      error?: (err: any) => void
    }) => void
  };
}

interface IDBService<T> {
  count: () => Promise<number>;
  saveAll: (data: T[]) => Promise<void>;
}

export const loadToIndexedDB = async<T>(
  IDB_SERVICE: IDBService<T>,
  API_SERVICE: ApiService<T>
): Promise<void> => {
  const alreadyLoaded = (await IDB_SERVICE.count()) > 0;
  if (alreadyLoaded) {
    console.log('Los datos ya están cargados en IndexedDB');
    return;
  }
  API_SERVICE.getAll().subscribe({
    next: async (data: any) => {
      await IDB_SERVICE.saveAll(data);
      console.log('Datos cargados a IndexedDB:', data.length);
    }
    ,
    error: (error: any) => {
      console.error('Error loading data to IndexedDB:', error);
    }
  });
}

// async syncProductTypesIfNeeded(): Promise<void> {
//   const lastSync = await this.productTypeIDB.getLastSync();
//   const now = new Date();
//   const today = now.toISOString().slice(0, 10);
//   const lastSyncDay = lastSync?.slice(0, 10);

//   if (lastSyncDay !== today) {
//     // Sincroniza con la API y guarda en indexedDB
//     this.productTypeService.getAllProductTypes().subscribe({
//       next: async (data) => {
//         await this.productTypeIDB.saveProductTypes(data);
//       }
//     });
//   }
//   console.log('Sincronización de tipos de producto completada.');
//   console.log('types', this.productTypeIDB.getProductTypes());
// }