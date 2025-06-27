import { Injectable } from "@angular/core";
import { TypeClient } from "@core/models/customer";

@Injectable({ providedIn: 'root' })
export class TypeClientIndexedDBService {
  private dbName = 'typeClientsDB';
  private typeClientsStore = 'typeClients';
  private metaStore = 'meta';

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.typeClientsStore)) {
          db.createObjectStore(this.typeClientsStore, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.metaStore)) {
          db.createObjectStore(this.metaStore);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveTypeClients(typeClients: TypeClient[]): Promise<void> {
    const db = await this.openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([this.typeClientsStore, this.metaStore], 'readwrite');
      const store = tx.objectStore(this.typeClientsStore);
      store.clear();
      typeClients.forEach(typeClient => store.put(typeClient));
      tx.objectStore(this.metaStore).put(new Date().toISOString(), 'lastSync');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getTypeClients(): Promise<TypeClient[]> {
    const db = await this.openDB();
    return new Promise<TypeClient[]>((resolve, reject) => {
      const tx = db.transaction(this.typeClientsStore, 'readonly');
      const store = tx.objectStore(this.typeClientsStore);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as TypeClient[]);
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