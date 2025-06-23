import { Injectable } from '@angular/core';
import { Product } from '@core/models/product';

@Injectable({ providedIn: 'root' })
export class ProductIndexedDBService {
  private dbName = 'cotiza-db';
  private productsStore = 'products';
  private metaStore = 'meta';

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.productsStore)) {
          db.createObjectStore(this.productsStore, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.metaStore)) {
          db.createObjectStore(this.metaStore);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProducts(products: Product[]): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([this.productsStore, this.metaStore], 'readwrite');
      const store = tx.objectStore(this.productsStore);
      store.clear();
      products.forEach(product => store.put(product));
      tx.objectStore(this.metaStore).put(new Date().toISOString(), 'lastSync');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getProducts(): Promise<Product[]> {
    const db = await this.openDB();
    return new Promise<Product[]>((resolve, reject) => {
      const tx = db.transaction(this.productsStore, 'readonly');
      const store = tx.objectStore(this.productsStore);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Product[]);
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
}