import { Injectable } from '@angular/core';
import { CotizaDB } from '@shared/sync/dexie-db';

@Injectable({ providedIn: 'root' })
export class DisplayCartIndexedDBService {
  private db = new CotizaDB();

  async saveAll(displayCarts: { id: number }[]): Promise<void> {
    await this.db.display_cart.clear();
    await this.db.display_cart.bulkAdd(displayCarts);
  }
  async getAll(): Promise<{ id: number }[]> {
    return await this.db.display_cart.toArray();
  }
}