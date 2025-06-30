import { Injectable } from '@angular/core';
import { Product } from '@core/models/product';
import { CotizaDB } from '../../../shared/sync/dexie-db';

@Injectable({ providedIn: 'root' })
export class ProductIndexedDBService {
  private db = new CotizaDB();

  async saveAll(products: Product[]): Promise<void> {
    await this.db.products.clear();
    await this.db.products.bulkAdd(products);
  }

  async getAll(): Promise<Product[]> {
    return await this.db.products.toArray();
  }

  count(): Promise<number> {
    return this.db.products.count();
  }

  async getById(id: number): Promise<Product | undefined> {
    return await this.db.products.get(id);
  }
}


// @Injectable({ providedIn: 'root' })
// export class ProductIndexedDBService {
//   private dbName = 'cotiza-db';
//   private productsStore = 'products';
//   private metaStore = 'meta';

//   private openDB(): Promise<IDBDatabase> {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, 1);
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async saveProducts(products: Product[]): Promise<void> {
//     const db = await this.openDB();
//     return new Promise<void>((resolve, reject) => {
//       const tx = db.transaction([this.productsStore, this.metaStore], 'readwrite');
//       const store = tx.objectStore(this.productsStore);
//       store.clear();
//       products.forEach(product => store.put(product));
//       tx.objectStore(this.metaStore).put(new Date().toISOString(), 'lastSync');
//       tx.oncomplete = () => resolve();
//       tx.onerror = () => reject(tx.error);
//     });
//   }

//   async getProducts(): Promise<Product[]> {
//     const db = await this.openDB();
//     return new Promise<Product[]>((resolve, reject) => {
//       const tx = db.transaction(this.productsStore, 'readonly');
//       const store = tx.objectStore(this.productsStore);
//       const request = store.getAll();
//       request.onsuccess = () => resolve(request.result as Product[]);
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
// }