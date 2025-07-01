import { Injectable } from "@angular/core";
import { TypeClient } from "@core/models/type_client";
import { CotizaDB } from "@shared/sync/dexie-db";



@Injectable({ providedIn: 'root' })
export class TypeClientIndexedDBService {
  private db = new CotizaDB();

  async saveAll(typeClients: TypeClient[]): Promise<void> {
    await this.db.type_clients.clear();
    await this.db.type_clients.bulkAdd(typeClients);
  }

  async getAll(): Promise<TypeClient[]> {
    return await this.db.type_clients.toArray();
  }

  count(): Promise<number> {
    return this.db.type_clients.count();
  }

}



// import { Injectable } from "@angular/core";
// import { TypeClient } from "@core/models/customer";

// @Injectable({ providedIn: 'root' })
// export class TypeClientIndexedDBService {
//   private dbName = 'cotiza-db';
//   private typeClientsStore = 'type_clients';
//   private metaStore = 'meta';

//   private openDB(): Promise<IDBDatabase> {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, 1);
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async saveTypeClients(typeClients: TypeClient[]): Promise<void> {
//     const db = await this.openDB();
//     return new Promise<void>((resolve, reject) => {
//       const tx = db.transaction([this.typeClientsStore, this.metaStore], 'readwrite');
//       const store = tx.objectStore(this.typeClientsStore);
//       store.clear();
//       typeClients.forEach(typeClient => store.put(typeClient));
//       tx.objectStore(this.metaStore).put(new Date().toISOString(), 'lastSync');
//       tx.oncomplete = () => resolve();
//       tx.onerror = () => reject(tx.error);
//     });
//   }

//   async getTypeClients(): Promise<TypeClient[]> {
//     const db = await this.openDB();
//     return new Promise<TypeClient[]>((resolve, reject) => {
//       const tx = db.transaction(this.typeClientsStore, 'readonly');
//       const store = tx.objectStore(this.typeClientsStore);
//       const request = store.getAll();
//       request.onsuccess = () => resolve(request.result as TypeClient[]);
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