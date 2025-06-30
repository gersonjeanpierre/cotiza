import { Injectable } from '@angular/core';
import { ProductType } from '@core/models/product-type';
import { CotizaDB } from '../../../shared/sync/dexie-db';

@Injectable({ providedIn: 'root' })
export class ProductTypeIndexedDBService {
  private db = new CotizaDB();
  async saveAll(productTypes: ProductType[]): Promise<void> {
    await this.db.product_type.clear();
    await this.db.product_type.bulkAdd(productTypes);
  }

  async getAll(): Promise<ProductType[]> {
    return await this.db.product_type.toArray();
  }
  count(): Promise<number> {
    return this.db.product_type.count();
  }

  async getById(id: number): Promise<ProductType | undefined> {
    return await this.db.product_type.get(id);
  }
}


// @Injectable({ providedIn: 'root' })
// export class ProductTypeIndexedDBService {
//   private dbName = 'cotiza-db';
//   private productTypesStore = 'product_types';
//   private metaStore = 'meta';

//   private openDB(): Promise<IDBDatabase> {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, 1);
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async getProductTypes(): Promise<ProductType[]> {
//     const db = await this.openDB();
//     return new Promise<ProductType[]>((resolve, reject) => {
//       const tx = db.transaction(this.productTypesStore, 'readonly');
//       const store = tx.objectStore(this.productTypesStore);
//       const request = store.getAll();
//       request.onsuccess = () => resolve(request.result as ProductType[]);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async getLastSync(): Promise<string | undefined> {
//     const db = await this.openDB();
//     return new Promise<string | undefined>((resolve, reject) => {
//       const tx = db.transaction(this.metaStore, 'readonly');
//       const store = tx.objectStore(this.metaStore);
//       const request = store.get('lastSync');
//       request.onsuccess = () => resolve(request.result as string | undefined);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async saveProductTypes(productTypes: ProductType[]): Promise<void> {
//     const db = await this.openDB();
//     return new Promise<void>((resolve, reject) => {
//       const tx = db.transaction([this.productTypesStore, this.metaStore], 'readwrite');
//       const store = tx.objectStore(this.productTypesStore);
//       store.clear();
//       productTypes.forEach(pt => store.put(pt));
//       tx.objectStore(this.metaStore).put(new Date().toISOString(), 'lastSync');
//       tx.oncomplete = () => resolve();
//       tx.onerror = () => reject(tx.error);
//     });
//   }

// }