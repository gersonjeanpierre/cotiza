// Puedes poner esto arriba de tu clase o en un archivo aparte

import { Product } from "@core/models/product";

function openCotizaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cotiza-db', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveProductsToIndexedDB(products: Product[]): Promise<void> {
  return openCotizaDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['products', 'meta'], 'readwrite');
      const store = tx.objectStore('products');
      store.clear();
      products.forEach(product => store.put(product));
      tx.objectStore('meta').put(new Date().toISOString(), 'lastSync');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

function getProductsFromIndexedDB(): Promise<Product[]> {
  return openCotizaDB().then(db => {
    return new Promise<Product[]>((resolve, reject) => {
      const tx = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Product[]);
      request.onerror = () => reject(request.error);
    });
  });
}

function getLastSyncDate(): Promise<string | undefined> {
  return openCotizaDB().then(db => {
    return new Promise<string | undefined>((resolve, reject) => {
      const tx = db.transaction('meta', 'readonly');
      const store = tx.objectStore('meta');
      const request = store.get('lastSync');
      request.onsuccess = () => resolve(request.result as string | undefined);
      request.onerror = () => reject(request.error);
    });
  });
}

export {
  openCotizaDB,
  saveProductsToIndexedDB,
  getProductsFromIndexedDB,
  getLastSyncDate
}