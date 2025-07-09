import { Injectable } from "@angular/core";
import { CotizaDB } from "@shared/sync/dexie-db";
import { Order } from "@core/models/order";

@Injectable({ providedIn: 'root' })
export class OrderIndexedDBService {
  private db = new CotizaDB();

  async saveAll(orders: Order[]): Promise<void> {
    await this.db.order.clear();
    await this.db.order.bulkPut(orders);
  }

  async getAll(): Promise<Order[]> {
    return await this.db.order.toArray();
  }
  count(): Promise<number> {
    return this.db.order.count();
  }

  async getById(id: number): Promise<Order | undefined> {
    return await this.db.order.get(id);
  }
}