import { Injectable } from '@angular/core';
import { ProductType } from '@core/models/product-type';

@Injectable({ providedIn: 'root' })
export class ProductTypeIndexedDBService {
  private dbName = 'cotiza-db';
  private productTypesStore = 'productTypes';
  private metaStore = 'meta';

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.productTypesStore)) {
          db.createObjectStore(this.productTypesStore, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.metaStore)) {
          db.createObjectStore(this.metaStore);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getProductTypes(): Promise<ProductType[]> {
    const db = await this.openDB();
    return new Promise<ProductType[]>((resolve, reject) => {
      const tx = db.transaction(this.productTypesStore, 'readonly');
      const store = tx.objectStore(this.productTypesStore);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as ProductType[]);
      request.onerror = () => reject(request.error);
    });
  }

  async getLastSync(): Promise<string | undefined> {
    const db = await this.openDB();
    return new Promise<string | undefined>((resolve, reject) => {
      const tx = db.transaction(this.metaStore, 'readonly');
      const store = tx.objectStore(this.metaStore);
      const request = store.get('lastSync');
      request.onsuccess = () => resolve(request.result as string | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProductTypes(productTypes: ProductType[]): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([this.productTypesStore, this.metaStore], 'readwrite');
      const store = tx.objectStore(this.productTypesStore);
      store.clear();
      productTypes.forEach(pt => store.put(pt));
      tx.objectStore(this.metaStore).put(new Date().toISOString(), 'lastSync');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

}